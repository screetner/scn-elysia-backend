import {afterEach, beforeEach, describe, it} from "bun:test";
import sinon from "sinon";
import {db} from "@/database/database";
import {postAsset} from "@/routes/python/python-service";
import {assetList} from "@/models/python";

describe('postAsset', () => {
    let insertStub: sinon.SinonStub;

    beforeEach(() => {
        insertStub = sinon.stub(db, 'insert').returns({
            values: sinon.stub().returns({
                execute: sinon.stub().resolves(),
            }),
        });
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should insert assets', async () => {
        const data: assetList = {
            recordedUserId: 'user123',
            assets: [
                {
                    geoCoordinate: {lat: 1, lng: 2},
                    assetTypeId: 'asset123',
                    imageFileName: 'image123',
                    recordedAt: new Date(),
                },
            ],
        };

        await postAsset(data);

        sinon.assert.calledOnce(insertStub);
    });
});