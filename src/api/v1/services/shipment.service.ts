import { ShipmentModel } from '../models/shipment.model';
import { IShipment } from '../../../types/shipment-types';

export const findAllShipments = async (): Promise<IShipment[]> => {
    return await ShipmentModel.findAll();
};

export const findShipmentById = async (id: string): Promise<IShipment | null> => {
    return await ShipmentModel.findById(id);
};

export const findShipmentsByOrderId = async (orderId: string): Promise<IShipment[]> => {
    return await ShipmentModel.findByOrderId(orderId);
};

export const findShipmentsByUserId = async (userId: string): Promise<IShipment[]> => {
    return await ShipmentModel.findByUserId(userId);
};

export const createShipment = async (shipmentData: Omit<IShipment, 'id' | 'createdAt' | 'updatedAt'>): Promise<IShipment> => {
    return await ShipmentModel.create(shipmentData);
};

export const updateShipment = async (id: string, updates: Partial<Omit<IShipment, 'id' | 'createdAt' | 'updatedAt'>>): Promise<IShipment | null> => {
    return await ShipmentModel.update(id, updates);
};
