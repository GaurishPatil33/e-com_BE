import { Request, Response } from 'express';
import * as addressService from '../services/address.service';
import { IAddress } from '../../../types/user-types';

export const getAddressById = async (req: Request, res: Response) => {
    try {
        const address = await addressService.findAddressById(req.params.id);
        if (!address) {
            return res.status(404).json({ message: 'Address not found' });
        }
        res.status(200).json(address);
    } catch (error) {
        console.error('Error getting address by ID:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

export const getAddressesByUserId = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user?.id; // Assuming user ID is available from auth middleware

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const addresses = await addressService.findAddressesByUserId(userId);
        res.status(200).json(addresses);
    } catch (error) {
        console.error('Error getting addresses by user ID:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

export const createAddress = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user?.id; // Assuming user ID is available from auth middleware

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const addressData: Omit<IAddress, 'id' | 'createdAt' | 'updatedAt'> = {
            ...req.body,
            user_id: userId,
        };

        const newAddress = await addressService.createAddress(addressData);
        res.status(201).json(newAddress);
    } catch (error) {
        console.error('Error creating address:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

export const updateAddress = async (req: Request, res: Response) => {
    try {
        const updatedAddress = await addressService.updateAddress(req.params.id, req.body);
        if (!updatedAddress) {
            return res.status(404).json({ message: 'Address not found' });
        }
        res.status(200).json(updatedAddress);
    } catch (error) {
        console.error('Error updating address:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

export const deleteAddress = async (req: Request, res: Response) => {
    try {
        const deleted = await addressService.deleteAddress(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: 'Address not found or could not be deleted' });
        }
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting address:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
