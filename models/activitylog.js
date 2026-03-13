// models/activitylog.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class ActivityLog extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // 1. Relasi Eksplisit: Log Activity menjadi milik User (Pelaku Aksi)
            ActivityLog.belongsTo(models.User, {
                foreignKey: 'userId',
                as: 'actor'
            });

            // 2. Relasi Implisit (Polymorphic): 
            // Sesuai prinsip Low Coupling, kita TIDAK mendefinisikan .belongsTo() 
            // ke model seperti Mentor, Book, dll. Kolom entityType dan entityId 
            // sudah cukup untuk kebutuhan rekam jejak tanpa mengikat integritas referensial.
        }
    }

    ActivityLog.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        action: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        entityType: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        entityId: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        details: {
            type: DataTypes.JSON,
            allowNull: true,
            // Memastikan data yang masuk selalu berupa objek JSON yang valid
            get() {
                const rawValue = this.getDataValue('details');
                return typeof rawValue === 'string' ? JSON.parse(rawValue) : rawValue;
            }
        }
    }, {
        sequelize,
        modelName: 'ActivityLog',
        tableName: 'ActivityLogs',
    });

    return ActivityLog;
};