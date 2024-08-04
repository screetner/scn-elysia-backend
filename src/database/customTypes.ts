import {customType} from "drizzle-orm/mysql-core";
import {SQL} from "drizzle-orm/sql/sql";
import {sql} from "drizzle-orm";

export const polygonDB = customType<
    {
        data: PolygonType;
        driverData: PolygonCoordinate;
    }
>({
    dataType() {
        return 'POLYGON SRID 4326';
    },
    toDriver(value: PolygonType): SQL {
        const points = value.map(point => `${point.longitude} ${point.latitude}`).join(', ');
        const wkt = `POLYGON((${points}, ${points.split(', ')[0]}))`;
        return sql`ST_PolygonFromText(${wkt},4326)`;
    },
    fromDriver: function (value: PolygonCoordinate): PolygonType {
        const polygon = value[0];
        return polygon.map(({ x, y }) => ({ longitude: x, latitude: y }))
    },
});

type PolygonCoordinate = {
    x: number;
    y: number;
}[][];

export const pointDB = customType<
    {
        data: PointType;
        driverData: PointCoordinate;
    }
>({
    dataType() {
        return 'POINT SRID 4326';
    },
    toDriver(value: PointType): SQL {
        const wkt = `POINT(${value.longitude} ${value.latitude})`;
        return sql`ST_PointFromText(${wkt},4326)`;
    },
    fromDriver: function (value: PointCoordinate): PointType {
        return { longitude: value.x, latitude: value.y };
    },
});

type PointCoordinate = {
    x: number;
    y: number;
};


export type PointType = {
    latitude: number;
    longitude: number;
}

export type PolygonType = PointType[]