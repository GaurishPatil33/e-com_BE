import { AddressModel } from '../models/address.model';
import { IAddress } from '../../../types/user-types';

export class AddressService {
  static async getAddressById(id: string): Promise<IAddress | null> {
    return AddressModel.findById(id);
  }

  static async getAddressesByUserId(userId: string): Promise<IAddress[]> {
    return AddressModel.findByUserId(userId);
  }

  static async createAddress(addressData: Omit<IAddress, 'id' | 'createdAt' | 'updatedAt'>): Promise<IAddress> {
    return AddressModel.create(addressData);
  }

  static async updateAddress(id: string, updates: Partial<Omit<IAddress, 'id' | 'createdAt' | 'updatedAt'>>): Promise<IAddress | null> {
    return AddressModel.update(id, updates);
  }

  static async deleteAddress(id: string): Promise<boolean> {
    return AddressModel.delete(id);
  }
}
