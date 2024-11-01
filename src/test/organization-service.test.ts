import { describe, expect, it, beforeEach, afterEach } from 'bun:test';
import sinon from 'sinon';
import {createOrganization, getAllOrganization} from '@/routes/organization/organization-service';
import { db } from "@/database/database";

describe('getAllOrganization', () => {
    let selectStub: sinon.SinonStub;

    beforeEach(() => {
        selectStub = sinon.stub(db, 'select');
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should return all organizations with their members and assets count', async () => {
        const mockData = [
            {
                orgId: 'org1',
                orgName: 'Organization 1',
                orgMember: 10,
                orgAssets: 5,
            },
            {
                orgId: 'org2',
                orgName: 'Organization 2',
                orgMember: 20,
                orgAssets: 15,
            },
        ];

        selectStub.returns({
            from: sinon.stub().returns({
                leftJoin: sinon.stub().returns({
                    leftJoin: sinon.stub().returns({
                        leftJoin: sinon.stub().returns({
                            groupBy: sinon.stub().resolves(mockData),
                        }),
                    }),
                }),
            }),
        });

        const result = await getAllOrganization();

        expect(result).toEqual(mockData);
        sinon.assert.calledOnce(selectStub);
    });

    it('should return an empty array if no organizations are found', async () => {
        selectStub.returns({
            from: sinon.stub().returns({
                leftJoin: sinon.stub().returns({
                    leftJoin: sinon.stub().returns({
                        leftJoin: sinon.stub().returns({
                            groupBy: sinon.stub().resolves([]),
                        }),
                    }),
                }),
            }),
        });

        const result = await getAllOrganization();

        expect(result).toEqual([]);
        sinon.assert.calledOnce(selectStub);
    });
});

describe('createOrganization', () => {
    let selectStub: sinon.SinonStub;
    let insertStub: sinon.SinonStub;

    beforeEach(() => {
        selectStub = sinon.stub(db, 'select');
        insertStub = sinon.stub(db, 'insert');
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should create a new organization successfully', async () => {
        selectStub.returns({
            from: sinon.stub().returns({
                where: sinon.stub().resolves([]),
            }),
        });

        insertStub.onFirstCall().returns({
            values: sinon.stub().returns({
                returning: sinon.stub().resolves([{ id: 'newOrgId' }]),
            }),
        });

        insertStub.onSecondCall().returns({
            values: sinon.stub().returns({
                returning: sinon.stub().resolves([{ id: 'defaultRoleId' }]),
            }),
        });

        insertStub.onThirdCall().returns({
            values: sinon.stub().returns({
                returning: sinon.stub().resolves([{ id: 'adminRoleId' }]),
            }),
        });

        const result = await createOrganization('New Organization');

        expect(result).toEqual({
            orgId: 'newOrgId',
            defaultRoleId: 'defaultRoleId',
            adminRoleId: 'adminRoleId',
        });

        sinon.assert.calledOnce(selectStub);
        sinon.assert.calledThrice(insertStub);
    });

    it('should throw an error if the organization already exists', async () => {
        selectStub.returns({
            from: sinon.stub().returns({
                where: sinon.stub().resolves([{ orgId: 'existingOrgId' }]),
            }),
        });

        expect(createOrganization('Existing Organization')).rejects.toThrow('Organization with name Existing Organization already exists');

        sinon.assert.calledOnce(selectStub);
        sinon.assert.notCalled(insertStub);
    });
});