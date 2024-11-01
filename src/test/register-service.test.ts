import { describe, expect, it, beforeEach, afterEach } from 'bun:test';
import sinon from 'sinon';
import {addNewMember, checkMemberToken} from '@/routes/register/register-service';
import { db } from "@/database/database";
import {password} from "bun";
import * as registerModel from "@/models/register";
import {JWTInvitePayload} from "@/models/auth";

describe('checkMemberToken', () => {
    let selectStub: sinon.SinonStub;

    beforeEach(() => {
        selectStub = sinon.stub(db, 'select');
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should throw an error if the invite token is not found', async () => {
        selectStub.returns({
            from: sinon.stub().returns({
                where: sinon.stub().resolves([]),
            }),
        });

        expect(checkMemberToken('invalidToken')).rejects.toThrow('Invite token invalidToken not found');
        sinon.assert.calledOnce(selectStub);
    });

    it('should not throw an error if the invite token is found', async () => {
        selectStub.returns({
            from: sinon.stub().returns({
                where: sinon.stub().resolves([{ token: 'validToken' }]),
            }),
        });

        expect(checkMemberToken('validToken')).toBeTruthy();
        sinon.assert.calledOnce(selectStub);
    });
});

describe('addNewMember', () => {
    let insertStub: sinon.SinonStub;
    let updateStub: sinon.SinonStub;
    let hashStub: sinon.SinonStub;

    beforeEach(() => {
        insertStub = sinon.stub(db, 'insert').returns({
            values: sinon.stub().returns({
                returning: sinon.stub().resolves([{ userId: 'newUserId' }]),
            }),
        });
        updateStub = sinon.stub(db, 'update').returns({
            set: sinon.stub().returns({
                where: sinon.stub().resolves(),
            }),
        });
        hashStub = sinon.stub(password, 'hash').resolves('hashedPassword');
    });

    afterEach(() => {
        sinon.restore();
    });

    const memberData: registerModel.register = {
        username: 'newUser',
        password: 'password123',
    };
    const jwtInvite: JWTInvitePayload = {
        email: 'test@example.com',
        orgId: 'org123',
        roleId: 'role123',
    };

    it('should add a new member successfully', async () => {
        const result = await addNewMember(memberData, jwtInvite, 'validToken');

        expect(result).toEqual({ userId: 'newUserId' });
        sinon.assert.calledOnce(insertStub);
        sinon.assert.calledOnce(updateStub);
        sinon.assert.calledOnce(hashStub);
    });

    it('should throw an error if the email is already registered', async () => {
        insertStub.returns({
            values: sinon.stub().returns({
                returning: sinon.stub().rejects(new Error('This email is already registered')),
            }),
        });

        expect(addNewMember(memberData, jwtInvite, 'validToken')).rejects.toThrow('This email is already registered');
        sinon.assert.calledOnce(insertStub);
        sinon.assert.notCalled(updateStub);
        sinon.assert.calledOnce(hashStub);
    });
});