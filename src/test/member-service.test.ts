import { describe, expect, it, beforeEach, afterEach } from 'bun:test';
import sinon from 'sinon';
import {checkEmailExist, getRecentMember} from '@/routes/member/member-service';
import { db } from "@/database/database";

describe('getRecentMember', () => {
    let selectStub: sinon.SinonStub;

    beforeEach(() => {
        selectStub = sinon.stub(db, 'select');
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should return recent members with correct data', async () => {
        const organizationId = 'org1';
        const limit = 5;
        const mockMembers = [
            { userId: '1', userName: 'User1', email: 'user1@example.com', roleName: 'Admin', createdAt: new Date() },
            { userId: '2', userName: 'User2', email: 'user2@example.com', roleName: 'Member', createdAt: new Date() },
        ];

        selectStub.returns({
            from: sinon.stub().returns({
                leftJoin: sinon.stub().returns({
                    where: sinon.stub().returns({
                        orderBy: sinon.stub().returns({
                            limit: sinon.stub().resolves(mockMembers),
                        }),
                    }),
                }),
            }),
        });

        const result = await getRecentMember(organizationId, limit);

        expect(result).toEqual(mockMembers);
        sinon.assert.calledOnce(selectStub);
    });

    it('should return an empty array if no members are found', async () => {
        const organizationId = 'org1';
        const limit = 5;

        selectStub.returns({
            from: sinon.stub().returns({
                leftJoin: sinon.stub().returns({
                    where: sinon.stub().returns({
                        orderBy: sinon.stub().returns({
                            limit: sinon.stub().resolves([]),
                        }),
                    }),
                }),
            }),
        });

        const result = await getRecentMember(organizationId, limit);

        expect(result).toEqual([]);
        sinon.assert.calledOnce(selectStub);
    });
});

describe('checkEmailExist', () => {
    let selectStub: sinon.SinonStub;

    beforeEach(() => {
        selectStub = sinon.stub(db, 'select');
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should throw an error if emails already exist', async () => {
        const emails = ['existing@example.com'];
        const mockExistingEmails = [{ email: 'existing@example.com' }];

        selectStub.returns({
            from: sinon.stub().returns({
                where: sinon.stub().resolves(mockExistingEmails),
            }),
        });

        expect(checkEmailExist(emails)).rejects.toThrow('These Emails already exist in other Org : existing@example.com');
        sinon.assert.calledOnce(selectStub);
    });

    it('should not throw an error if no emails exist', async () => {
        const emails = ['new@example.com'];

        selectStub.returns({
            from: sinon.stub().returns({
                where: sinon.stub().resolves([]),
            }),
        });

        expect(checkEmailExist(emails)).toBeTruthy();
        sinon.assert.calledOnce(selectStub);
    });
});

// describe('addInviteToDatabase', () => {
//     let insertStub: sinon.SinonStub;
//
//     beforeEach(() => {
//         insertStub = sinon.stub(db, 'insert');
//     });
//
//     afterEach(() => {
//         sinon.restore();
//     });
//
//     it('should insert invite tokens into the database', async () => {
//         const userId = 'user1';
//         const organizationId = 'org1';
//         const tokens = ['token1', 'token2', 'token3'];
//
//         tokens.forEach(token => {
//             insertStub.onCall(tokens.indexOf(token)).returns({
//                 values: sinon.stub().resolves(),
//             });
//         });
//
//         await addInviteToDatabase(userId, organizationId, tokens);
//
//         expect(insertStub.callCount).toBe(tokens.length);
//         tokens.forEach((token, index) => {
//             expect(insertStub.getCall(index).args[0]).toEqual(schemas.inviteTable);
//             expect(insertStub.getCall(index).returnValue.values.getCall(0).args[0]).toEqual({
//                 userId,
//                 organizationId,
//                 token,
//             });
//         });
//     });
// });