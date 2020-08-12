import { Response, Request } from 'express';
import db from '../database/connection';

class ControllerConnections {
  async index(req: Request, res: Response) {
    try {
      const totalConnections = await db('connections').count('* as total');
      const { total } = totalConnections[0];
      return res.status(200).send({ total });
    } catch (error) {
      return res.status(400).send({ message: 'Error on get all connection!' });
    }
  }

  async store(req: Request, res: Response) {
    const { user_id } = req.body;
    try {
      await db('connections').insert({
        user_id,
      });
      return res.status(201).send({ message: 'Connection saved' });
    } catch (error) {
      return res.status(400).send({ message: 'Error on create connection!' });
    }
  }
}

export default new ControllerConnections();
