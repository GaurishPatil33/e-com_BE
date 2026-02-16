import { AddressModel } from '../models/address.model';
import { IAddress } from '../../../types/user-types';

export const findAddressById = async (id: string): Promise<IAddress | null> => {
    return await AddressModel.findById(id);
};

export const findAddressesByUserId = async (userId: string): Promise<IAddress[]> => {
    return await AddressModel.findByUserId(userId);
};

export const createAddress = async (addressData: Omit<IAddress, 'id' | 'createdAt' | 'updatedAt'>): Promise<IAddress> => {
    return await AddressModel.create(addressData);
};

export const updateAddress = async (id: string, updates: Partial<Omit<IAddress, 'id' | 'createdAt' | 'updatedAt'>>): Promise<IAddress | null> => {
    return await AddressModel.update(id, updates);
};

export const deleteAddress = async (id: string): Promise<boolean> => {
    return await AddressModel.delete(id);
};