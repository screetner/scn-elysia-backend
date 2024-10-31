import { describe, expect, it, beforeEach, afterEach } from 'bun:test';
import sinon from 'sinon';
import { changePassword } from '@/routes/user/user-services';
import { db } from "@/database/database";
import { password } from "bun";

describe('changePassword', () => {
    let selectStub: sinon.SinonStub;
    let updateStub: sinon.SinonStub;
    let hashStub: sinon.SinonStub;
    let verifyStub: sinon.SinonStub;

    beforeEach(() => {
        selectStub = sinon.stub(db, 'select').returns({
            from: sinon.stub().returnsThis(),
            where: sinon.stub().returnsThis(),
        });
        updateStub = sinon.stub(db, 'update').returns({
            set: sinon.stub().returnsThis(),
            where: sinon.stub().returnsThis(),
            returning: sinon.stub().resolves([{ password: 'newEncryptedPassword' }]),
        });
        hashStub = sinon.stub(password, 'hash');
        verifyStub = sinon.stub(Bun.password, 'verify');
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should throw an error if user is not found', async () => {
        selectStub.returns({
            from: sinon.stub().returns({
                where: sinon.stub().resolves([]),
            }),
        });

        expect(changePassword('user123', 'newPassword', 'oldPassword')).rejects.toThrow("User not found");

        sinon.assert.calledOnce(selectStub);
    });

    const userData = {
        userId: 'user123',
        roleId: 'role123',
        username: 'iAmUser',
        email: 'email123',
        password: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    it('should throw an error if new password is the same as the old one', async () => {
        selectStub.returns({
            from: sinon.stub().returns({
                where: sinon.stub().resolves([userData]),
            }),
        });
        verifyStub.onFirstCall().resolves(true);
        verifyStub.onSecondCall().resolves(true);

        expect(changePassword('user123', 'hashedPassword', 'oldPassword')).rejects.toThrow("Password is same as old password");

        sinon.assert.calledTwice(verifyStub);
        sinon.assert.notCalled(updateStub);
    });

    it('should successfully change the password when conditions are met', async () => {
        selectStub.returns({
            from: sinon.stub().returns({
                where: sinon.stub().resolves([userData]),
            }),
        });
        verifyStub.onFirstCall().resolves(true);
        verifyStub.onSecondCall().resolves(false);
        hashStub.resolves('newEncryptedPassword');

        await changePassword('user123', 'newPassword', 'oldPassword');

        sinon.assert.calledTwice(verifyStub);
        sinon.assert.calledOnceWithExactly(hashStub, 'newPassword', 'bcrypt');
        sinon.assert.calledOnce(updateStub);
    });
});