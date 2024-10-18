import { describe, expect, it, beforeEach, afterEach } from 'bun:test';
import sinon from 'sinon';
import {db} from "@/database/database";
import * as schemas from '@/database/schemas'
import {findAssetById} from "@/routes/assets/asset-services";
import {eq} from "drizzle-orm";

describe('findAssetById', () => {
  let findFirstStub: sinon.SinonStub;

  beforeEach(() => {
    findFirstStub = sinon.stub(db.query.assetTable, 'findFirst');
  });

  afterEach(() => {
    findFirstStub.restore();
  });

  it('should return the asset when assetId exists', async () => {
    const mockResponse = {
      assetId: 'asset123',
      assetTypeId: 'assetType123',
      createdAt: new Date(),
      updatedAt: new Date(),
      geoCoordinate: [1, 2] as [number, number],
      imageFileLink: 'https://example.com/image.jpg',
      recordedUser: 'user123',
      recordedAt: new Date(),
    }
    findFirstStub.withArgs({
      where: eq(schemas.assetTable.assetId, 'asset123'),
    }).returns(Promise.resolve(mockResponse));

    const result1 = await findAssetById('asset123');

    sinon.assert.calledWith(findFirstStub, {
        where: eq(schemas.assetTable.assetId, 'asset123'),
    })

    expect(result1).toEqual(mockResponse);
  });

  it('should return null when assetId does not exist', async () => {
    findFirstStub.resolves(undefined);

    const result2 = await findAssetById('asset123');

    sinon.assert.calledWith(findFirstStub, {
      where: eq(schemas.assetTable.assetId, 'asset123'),
    });

    expect(result2).toBeUndefined();

  });
});