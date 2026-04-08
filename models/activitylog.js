'use strict';
import { Model } from 'sequelize'; // Gunakan import, bukan require

export default (sequelize, DataTypes) => { // Gunakan export default
    class ActivityLog extends Model {
        static associate(models) {
            ActivityLog.belongsTo(models.User, {
                foreignKey: 'userId',
                as: 'actor'
            });
        }
    }

    ActivityLog.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        action: {
            type: DataTypes.STRING,
            allowNull: false,
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
        }
    }, {
        sequelize,
        modelName: 'ActivityLog',
        tableName: 'ActivityLogs',
    });

    return ActivityLog;
};