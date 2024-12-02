import { describe, expect, it, beforeEach, afterEach } from 'bun:test'
import sinon from 'sinon'
import { db } from '@/database/database'
import {
  countAssetsByOrgId,
  findAssetsByOrgId,
} from '@/routes/assets/asset-services'

describe('findAssetsByOrgId', () => {
  let selectStub: sinon.SinonStub

  beforeEach(() => {
    selectStub = sinon.stub(db, 'select').returns({
      from: sinon.stub().returnsThis(),
      innerJoin: sinon.stub().returnsThis(),
      where: sinon.stub().returnsThis(),
    })
  })

  afterEach(() => {
    sinon.restore()
  })

  it('should return assets for the given organization ID', async () => {
    const mockResponse = [
      {
        assetId: 'asset123',
        geoCoordinate: [1, 2] as [number, number],
        assetType: 'type123',
        recordedUser: 'user123',
        organizationName: 'org123',
      },
    ]
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
    })

    const result = await findAssetsByOrgId('org123')

    expect(result).toEqual(mockResponse)
    sinon.assert.calledOnce(selectStub)
  })

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
    })

    const result = await findAssetsByOrgId('org123')

    expect(result).toEqual([])
    sinon.assert.calledOnce(selectStub)
  })
})

function setupSelectStub(mockResponse: any) {
  const selectStub = sinon.stub(db, 'select')
  const fromStub = sinon.stub().returnsThis()
  const innerJoinStub = sinon.stub().returnsThis()
  const whereStub = sinon.stub().resolves(mockResponse)

  selectStub.returns({
    from: fromStub,
    innerJoin: innerJoinStub,
    where: whereStub,
  })

  return selectStub
}

describe('countAssetsByOrgId', () => {
  let selectStub: sinon.SinonStub

  afterEach(() => {
    sinon.restore()
  })

  it('should return the total number of assets for the given organization ID', async () => {
    const mockCount = [{ total: 5 }]
    selectStub = setupSelectStub(mockCount)

    const result = await countAssetsByOrgId('org123')
    expect(result).toEqual(mockCount)
    sinon.assert.calledOnce(selectStub)
  })

  it('should return zero if no assets are found for the given organization ID', async () => {
    const mockCount = [{ total: 0 }]
    selectStub = setupSelectStub(mockCount)

    const result = await countAssetsByOrgId('org123')
    expect(result).toEqual(mockCount)
    sinon.assert.calledOnce(selectStub)
  })
})
