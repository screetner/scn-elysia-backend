import { describe, expect, it, beforeEach, afterEach } from 'bun:test';
import sinon from 'sinon';
import {db} from "@/database/database";
import * as schemas from '@/database/schemas'
import {countAssetsByOrgId, findAssetById, findAssetsByOrgId} from "@/routes/assets/asset-services";
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

describe('findAssetsByOrgId', () => {
  let selectStub: sinon.SinonStub;

  beforeEach(() => {
    selectStub = sinon.stub(db, 'select').returns({
      from: sinon.stub().returnsThis(),
      innerJoin: sinon.stub().returnsThis(),
      where: sinon.stub().returnsThis(),
    });
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should return assets for the given organization ID', async () => {
    const mockResponse = [
      {
        assetId: 'asset123',
        geoCoordinate: [1, 2] as [number, number],
        assetType: 'type123',
        recordedUser: 'user123',
        organizationName: 'org123',
      },
    ];
    selectStub.returns({
      from: sinon.stub().returns({
        innerJoin: sinon.stub().returns({
          innerJoin: sinon.stub().returns({
            innerJoin: sinon.stub().returns({
              innerJoin: sinon.stub().returns({
                where: sinon.stub().resolves(mockResponse),
              }),
            }),
          }),
        }),
      }),
    });

    const result = await findAssetsByOrgId('org123');

    expect(result).toEqual(mockResponse);
    sinon.assert.calledOnce(selectStub);
  });

  it('should return an empty array if no assets are found for the given organization ID', async () => {
    selectStub.returns({
      from: sinon.stub().returns({
        innerJoin: sinon.stub().returns({
          innerJoin: sinon.stub().returns({
            innerJoin: sinon.stub().returns({
              innerJoin: sinon.stub().returns({
                where: sinon.stub().resolves([]),
              }),
            }),
          }),
        }),
      }),
    });

    const result = await findAssetsByOrgId('org123');

    expect(result).toEqual([]);
    sinon.assert.calledOnce(selectStub);
  });
});

function setupSelectStub(mockResponse: any) {
  const selectStub = sinon.stub(db, 'select');
  const fromStub = sinon.stub().returnsThis();
  const innerJoinStub = sinon.stub().returnsThis();
  const whereStub = sinon.stub().resolves(mockResponse);

  selectStub.returns({
    from: fromStub,
    innerJoin: innerJoinStub,
    where: whereStub,
  });

  return selectStub;
}

describe('countAssetsByOrgId', () => {
  let selectStub: sinon.SinonStub;

  afterEach(() => {
    sinon.restore();
  });

  it('should return the total number of assets for the given organization ID', async () => {
    const mockCount = [{ total: 5 }];
    selectStub = setupSelectStub(mockCount);

    const result = await countAssetsByOrgId('org123');
    expect(result).toEqual(mockCount);
    sinon.assert.calledOnce(selectStub);
  });

  it('should return zero if no assets are found for the given organization ID', async () => {
    const mockCount = [{ total: 0 }];
    selectStub = setupSelectStub(mockCount);

    const result = await countAssetsByOrgId('org123');
    expect(result).toEqual(mockCount);
    sinon.assert.calledOnce(selectStub);
  });
});