import { Request, Response } from 'express';
import * as shipmentService from '../services/shipment.service';
import { IShipment } from '../../../types/shipment-types';

export const getAllShipments = async (req: Request, res: Response) => {
    const shipments = await shipmentService.findAllShipments();
    res.status(200).json(shipments);
};

export const getShipmentById = async (req: Request, res: Response) => {
    const shipment = await shipmentService.findShipmentById(req.params.id);
    if (!shipment) {
        return res.status(404).json({ message: 'Shipment not found' });
    }
    res.status(200).json(shipment);
};

export const getShipmentsByOrderId = async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const shipments = await shipmentService.findShipmentsByOrderId(orderId);
    res.status(200).json(shipments);
};

export const getShipmentsByUserId = async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.user?.id; // Assuming user ID is available from auth middleware

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const shipments = await shipmentService.findShipmentsByUserId(userId);
    res.status(200).json(shipments);
};

export const createShipment = async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.user?.id; // Assuming user ID is available from auth middleware

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const shipmentData: Omit<IShipment, 'id' | 'createdAt' | 'updatedAt'> = {
        ...req.body,
        userId: userId,
        status: 'pending', // Default status
    };

    const newShipment = await shipmentService.createShipment(shipmentData);
    res.status(201).json(newShipment);
};

export const updateShipment = async (req: Request, res: Response) => {
    const updatedShipment = await shipmentService.updateShipment(req.params.id, req.body);
    if (!updatedShipment) {
        return res.status(404).json({ message: 'Shipment not found' });
    }
    res.status(200).json(updatedShipment);
};
