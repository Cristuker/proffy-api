import { Request, Response } from 'express';
import db from '../database/connection';
import { ScheduleItem, Filters } from '../interfaces/index';
import convertHourToMinutes from '../utils/convertHourToMinutes';

class ClassesController {
  async store(req: Request, res: Response) {
    const {
      name, avatar, whatsapp, bio, subject, cost, schedule,
    } = req.body;
    const trx = await db.transaction();
    try {
      const insertedUserIds = await trx('users').insert({
        name,
        avatar,
        whatsapp,
        bio,
      });
      const user_id = insertedUserIds[0];

      const insertedClasses = await trx('classes').insert({
        subject,
        cost,
        user_id,
      });

      const class_id = insertedClasses[0];

      const classSchedule = schedule.map((scheduleItem: ScheduleItem) => ({
        class_id,
        week_day: scheduleItem.week_day,
        from: convertHourToMinutes(scheduleItem.from),
        to: convertHourToMinutes(scheduleItem.to),
      }));

      await trx('class_schedule').insert(classSchedule);

      await trx.commit();

      return res.status(201).send({ message: 'Class create whit success' });
    } catch (error) {
      await trx.rollback();
      return res.status(400).send({ message: 'Unexpected error while creating new classes' });
    }
  }

  async index(req: Request, res: Response) {
    const filters: Filters = req.query;
    if (!filters.subject || !filters.week_day || !filters.time) {
      return res.status(400).send({
        message: 'Filters is required [Timne, Subject, week_day]',
      });
    }

    const timeInMinutes = convertHourToMinutes(filters.time);

    try {
      const classes = await db('classes')
      // eslint-disable-next-line func-names
        .whereExists(function () {
          this.select('class_schedule.*')
            .from('class_schedule')
            .whereRaw('`class_schedule`.`class_id` = `classes`.`id`')
            .whereRaw('`class_schedule`.`week_day` = ??', [Number(filters.week_day)])
            .whereRaw('`class_schedule`.`from` <= ??', [timeInMinutes])
            .whereRaw('`class_schedule`.`to` > ??', [timeInMinutes]);
        })
        .where('classes.subject', '=', filters.subject)
        .join('users', 'classes.user_id', '=', 'users.id')
        .select(['classes.*', 'users.*']);

      if (classes.length === 0) {
        res.status(200).send(classes);
      }
      return res.status(201).send(classes);
    } catch (error) {
      return res.status(400).send({ message: 'Unexpected error while searching for classes' });
    }
  }
}

export default new ClassesController();
