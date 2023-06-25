import { OrderInterface } from 'interfaces/order';
import { RestaurantInterface } from 'interfaces/restaurant';
import { GetQueryInterface } from 'interfaces';

export interface TableInterface {
  id?: string;
  number: number;
  restaurant_id: string;
  created_at?: any;
  updated_at?: any;
  order?: OrderInterface[];
  restaurant?: RestaurantInterface;
  _count?: {
    order?: number;
  };
}

export interface TableGetQueryInterface extends GetQueryInterface {
  id?: string;
  restaurant_id?: string;
}
