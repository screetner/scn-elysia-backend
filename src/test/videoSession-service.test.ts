import { describe, expect, it, beforeEach, afterEach } from 'bun:test';
import sinon from 'sinon';
import { db } from "@/database/database";
import {postVideoSession, removeVideoSession, updateVideoSession} from "@/routes/videoSession/videoSession-service";
import {videoSessionStateEnum} from "@/models/videoSession";

describe('postVideoSession', () => {
    let dbInsertStub: sinon.SinonStub;

    beforeEach(() => {
        dbInsertStub = sinon.stub(db, 'insert');
    });

    afterEach(() => {
        dbInsertStub.restore();
    });

    it('should return the video session ID', async () => {
        const videoSessionId = 'videoSessionId';
        dbInsertStub.returns({
            values: sinon.stub().returns({
                returning: sinon.stub().resolves([{ videoSessionId }])
            })
        });

        const result = await postVideoSession('userId', { uploadProgress: 0, videoNames: ['video-123'] });

        expect(result).toEqual({ videoSessionId });
    });

    it('should throw an error if database insert fails', async () => {
        dbInsertStub.returns({
            values: sinon.stub().returns({
                returning: sinon.stub().rejects(new Error('Database error'))
            })
        });

        expect(postVideoSession('userId', {uploadProgress: 0, videoNames: ['video-123']}))
            .rejects
            .toThrow('Database error');
    });

    it('should throw an error if uploadProgress is less than 0', async () => {
        expect(postVideoSession('userId', {uploadProgress: -1, videoNames: []}))
            .rejects
            .toThrow('Invalid input data: uploadProgress must be between 0 and 100');
    });

    it('should throw an error if input data is invalid', async () => {
        expect(postVideoSession('userId', {uploadProgress: 0, videoNames: []}))
            .rejects
            .toThrow('Invalid input data: videoNames must be a non-empty array');
    });
});

describe('updateVideoSession', () => {
    let dbSelectStub: sinon.SinonStub;
    let dbUpdateStub: sinon.SinonStub;

    beforeEach(() => {
        dbSelectStub = sinon.stub(db, 'select');
        dbUpdateStub = sinon.stub(db, 'update');
    });

    afterEach(() => {
        dbSelectStub.restore();
        dbUpdateStub.restore();
    });

    it('should return the video session ID', async () => {
        const videoSessionId = 'videoSessionId';
        dbSelectStub.returns({
            from: sinon.stub().returns({
                where: sinon.stub().resolves([{ state: videoSessionStateEnum.UPLOADING }])
            })
        });
        dbUpdateStub.returns({
            set: sinon.stub().returns({
                where: sinon.stub().returns({
                    returning: sinon.stub().resolves([{ videoSessionId }])
                })
            })
        });

        const result = await updateVideoSession('videoSessionId', 0, videoSessionStateEnum.PROCESSING, 'userId');

        expect(result).toEqual({ videoSessionId });
    });

    it('should throw an error if video session is not found', async () => {
        dbSelectStub.returns({
            from: sinon.stub().returns({
                where: sinon.stub().resolves([])
            })
        });

        expect(updateVideoSession('videoSessionId', 0, videoSessionStateEnum.PROCESSING, 'userId'))
            .rejects
            .toThrow('Video session with ID videoSessionId not found');
    });

    it('should throw an error if database update fails', async () => {
        dbSelectStub.returns({
            from: sinon.stub().returns({
                where: sinon.stub().resolves([{ state: 'uploading' }])
            })
        });
        dbUpdateStub.returns({
            set: sinon.stub().returns({
                where: sinon.stub().returns({
                    returning: sinon.stub().rejects(new Error('Database error'))
                })
            })
        });

        expect(updateVideoSession('videoSessionId', 0, videoSessionStateEnum.PROCESSING, 'userId'))
            .rejects
            .toThrow('Database error');
    });
});

describe('removeVideoSession', () => {
    let dbSelectStub: sinon.SinonStub;
    let dbDeleteStub: sinon.SinonStub;

    beforeEach(() => {
        dbSelectStub = sinon.stub(db, 'select');
        dbDeleteStub = sinon.stub(db, 'delete');
    });

    afterEach(() => {
        dbSelectStub.restore();
        dbDeleteStub.restore();
    });

    it('should remove the video session', async () => {
        dbSelectStub.returns({
            from: sinon.stub().returns({
                where: sinon.stub().resolves([{ state: videoSessionStateEnum.CAN_DELETE }])
            })
        });
        dbDeleteStub.returns({
            where: sinon.stub().resolves()
        });

        await removeVideoSession('videoSessionId', 'userId');

        expect(dbDeleteStub.calledOnce).toBe(true);
    });

    it('should throw an error if video session is not found', async () => {
        dbSelectStub.returns({
            from: sinon.stub().returns({
                where: sinon.stub().resolves([])
            })
        });

        expect(removeVideoSession('videoSessionId', 'userId'))
            .rejects
            .toThrow('Video session with ID videoSessionId not found');
    });

    it('should throw an error if video session is not in the CAN_DELETE state', async () => {
        dbSelectStub.returns({
            from: sinon.stub().returns({
                where: sinon.stub().resolves([{ state: videoSessionStateEnum.UPLOADING }])
            })
        });

        expect(removeVideoSession('videoSessionId', 'userId'))
            .rejects
            .toThrow(`Cannot remove video session with ID videoSessionId because it is not in the '${videoSessionStateEnum.CAN_DELETE}' state`);
    });
});