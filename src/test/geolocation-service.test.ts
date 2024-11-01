import { describe, expect, it, beforeEach, afterEach } from 'bun:test';
import sinon from 'sinon';
import {getGeo, postGeo} from '@/routes/geolocation/geolocation-service';
import { db } from "@/database/database";
import { PostGeoBodyType } from "@/models/geolocation";

describe('postGeo', () => {
    let updateStub: sinon.SinonStub;

    beforeEach(() => {
        updateStub = sinon.stub(db, 'update').returns({
            set: sinon.stub().returns({
                where: sinon.stub().returns({
                    returning: sinon.stub().resolves([{ id: 'org123' }]),
                }),
            }),
        });
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should update the organization border successfully', async () => {
        const body: PostGeoBodyType = [
            { latitude: 40.7128, longitude: -74.0060 },
            { latitude: 34.0522, longitude: -118.2437 }
        ];
        const organizationId = 'org123';

        const result = await postGeo(body, organizationId);

        expect(result).toEqual([{ id: 'org123' }]);
        sinon.assert.calledOnce(updateStub);
    });
});

describe('getGeo', () => {
    let findFirstStub: sinon.SinonStub;

    beforeEach(() => {
        findFirstStub = sinon.stub(db.query.organizationTable, 'findFirst');
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should return the organization border successfully', async () => {
        const mockBorder = [
            { latitude: 40.7128, longitude: -74.0060 },
            { latitude: 34.0522, longitude: -118.2437 }
        ];

        findFirstStub.resolves({ border: mockBorder });

        const result = await getGeo('org123');

        expect(result).toEqual(mockBorder);
        sinon.assert.calledOnce(findFirstStub);
    });

    it('should return an empty array if no border is found', async () => {
        findFirstStub.resolves(null);

        const result = await getGeo('org123');

        expect(result).toEqual([]);
        sinon.assert.calledOnce(findFirstStub);
    });
});