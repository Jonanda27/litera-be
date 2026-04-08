'use strict';
import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class Transaction extends Model {
    static associate(models) {
      this.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    }
  }

  Transaction.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    order_id: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
    },
    status: {
      type: DataTypes.ENUM('pending', 'settlement', 'expire', 'cancel', 'deny'),
      defaultValue: 'pending'
    },
    payment_type: {
      type: DataTypes.STRING,
    }
  }, {
    sequelize,
    modelName: 'Transaction',
    tableName: 'Transactions',
  });

  return Transaction;
};
