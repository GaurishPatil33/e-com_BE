import { Request, Response } from 'express';
import * as shipmentService from '../services/shipment.service';
import { IShipment } from '../../../types/shipment-types';

export const getAllShipments = async (req: Request, res: Response) => {
    try {
        const shipments = await shipmentService.findAllShipments();
        res.status(200).json(shipments);
    } catch (error) {
        console.error('Error getting all shipments:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

export const getShipmentById = async (req: Request, res: Response) => {
    try {
        const shipment = await shipmentService.findShipmentById(req.params.id);
        if (!shipment) {
            return res.status(404).json({ message: 'Shipment not found' });
        }
        res.status(200).json(shipment);
    } catch (error) {
        console.error('Error getting shipment by ID:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

export const getShipmentsByOrderId = async (req: Request, res: Response) => {
    try {
        const { orderId } = req.params;
        const shipments = await shipmentService.findShipmentsByOrderId(orderId);
        res.status(200).json(shipments);
    } catch (error) {
        console.error('Error getting shipments by order ID:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

export const getShipmentsByUserId = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user?.id; // Assuming user ID is available from auth middleware

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const shipments = await shipmentService.findShipmentsByUserId(userId);
        res.status(200).json(shipments);
    } catch (error) {
        console.error('Error getting shipments by user ID:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

export const createShipment = async (req: Request, res: Response) => {
    try {
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
    } catch (error) {
        console.error('Error creating shipment:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

export const updateShipment = async (req: Request, res: Response) => {
    try {
        const updatedShipment = await shipmentService.updateShipment(req.params.id, req.body);
        if (!updatedShipment) {
            return res.status(404).json({ message: 'Shipment not found' });
        }
        res.status(200).json(updatedShipment);
    } catch (error) {
        console.error('Error updating shipment:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
