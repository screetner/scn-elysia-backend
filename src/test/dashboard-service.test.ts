import { describe, expect, it, beforeEach, afterEach } from 'bun:test';
import sinon from 'sinon';
import {countAdmins, countInvites, countMembers} from '@/routes/dashboard/dashboard-service';
import { db } from "@/database/database";

describe('countMembers', () => {
    let selectStub: sinon.SinonStub;

    beforeEach(() => {
        selectStub = sinon.stub(db, 'select');
    });

    afterEach(() => {
        sinon.restore();
    });

    function setupSelectStub(allMembers: number, currentMonthCount: number, previousMonthCount: number) {
        selectStub.onFirstCall().returns({
            from: sinon.stub().returns({
                leftJoin: sinon.stub().returns({
                    where: sinon.stub().returns({
                        then: sinon.stub().resolves(allMembers),
                    }),
                }),
            }),
        });
        selectStub.onSecondCall().returns({
            from: sinon.stub().returns({
                leftJoin: sinon.stub().returns({
                    where: sinon.stub().returns({
                        then: sinon.stub().resolves(currentMonthCount),
                    }),
                }),
            }),
        });
        selectStub.onThirdCall().returns({
            from: sinon.stub().returns({
                leftJoin: sinon.stub().returns({
                    where: sinon.stub().returns({
                        then: sinon.stub().resolves(previousMonthCount),
                    }),
                }),
            }),
        });
    }

    it('should return member information with correct counts and percentage increase', async () => {
        const organizationId = 'org1';
        setupSelectStub(30, 10, 8);

        const result = await countMembers(organizationId);

        expect(result).toEqual({
            allMembers: 30,
            percentageIncrease: 25,
        });

        sinon.assert.calledThrice(selectStub);
    });

    it('should return 100% increase if there were no members in the previous month', async () => {
        const organizationId = 'org1';
        setupSelectStub(30, 10, 0);

        const result = await countMembers(organizationId);

        expect(result).toEqual({
            allMembers: 30,
            percentageIncrease: 100,
        });

        sinon.assert.calledThrice(selectStub);
    });
});

describe('countInvites', () => {
    let selectStub: sinon.SinonStub;

    beforeEach(() => {
        selectStub = sinon.stub(db, 'select');
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should return invite information with correct counts', async () => {
        const organizationId = 'org1';
        const mockInviteData = {
            inviteTotal: 50,
            inviteActivate: 30,
        };

        selectStub.returns({
            from: sinon.stub().returns({
                where: sinon.stub().resolves([mockInviteData]),
            }),
        });

        const result = await countInvites(organizationId);

        expect(result).toEqual(mockInviteData);
        sinon.assert.calledOnce(selectStub);
    });

    it('should return zero counts if no invites are found', async () => {
        const organizationId = 'org1';
        const mockInviteData = {
            inviteTotal: 0,
            inviteActivate: 0,
        };

        selectStub.returns({
            from: sinon.stub().returns({
                where: sinon.stub().resolves([mockInviteData]),
            }),
        });

        const result = await countInvites(organizationId);

        expect(result).toEqual(mockInviteData);
        sinon.assert.calledOnce(selectStub);
    });
});

describe('countAdmins', () => {
    let selectStub: sinon.SinonStub;

    beforeEach(() => {
        selectStub = sinon.stub(db, 'select');
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should return the correct number of admins', async () => {
        const organizationId = 'org1';
        const mockAdminCount = 5;

        selectStub.returns({
            from: sinon.stub().returns({
                where: sinon.stub().resolves(Array(mockAdminCount).fill({})),
            }),
        });

        const result = await countAdmins(organizationId);

        expect(result).toEqual(mockAdminCount);
        sinon.assert.calledOnce(selectStub);
    });

    it('should return zero if no admins are found', async () => {
        const organizationId = 'org1';

        selectStub.returns({
            from: sinon.stub().returns({
                where: sinon.stub().resolves([]),
            }),
        });

        const result = await countAdmins(organizationId);

        expect(result).toEqual(0);
        sinon.assert.calledOnce(selectStub);
    });
});