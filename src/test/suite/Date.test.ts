import * as assert from "assert";
import * as sinon from "sinon";
import * as dateMock from "../../Date";
import Settings from "../../Settings";

suite("Test Date", () => {
    test("test parse iso date format", async () => {
        const stub = sinon.stub(Settings, "getDateFormat").callsFake(() => { return "YYYY-MM-DD"; });

        const res = dateMock.parseDate(new Date("2024-12-31")).toString();

        assert.strictEqual(res, "2024-12-31");

        stub.restore();
    });

    test("test parse DD-MM-YYYY date format", async () => {
        const stub = sinon.stub(Settings, "getDateFormat").callsFake(() => { return "DD-MM-YYYY"; });

        const res = dateMock.parseDate(new Date("2024-12-31")).toString();

        assert.strictEqual(res, "31-12-2024");

        stub.restore();
    });

    test("test parse MM.DD.YYYY date format", async () => {
        const stub = sinon.stub(Settings, "getDateFormat").callsFake(() => { return "MM.DD.YYYY"; });

        const res = dateMock.parseDate(new Date("2024-12-31")).toString();

        assert.strictEqual(res, "12.31.2024");

        stub.restore();
    });

    test("test parse DD/MM/YYYY date format", async () => {
        const stub = sinon.stub(Settings, "getDateFormat").callsFake(() => { return "DD/MM/YYYY"; });

        const res = dateMock.parseDate(new Date("2024-12-31")).toString();

        assert.strictEqual(res, "31/12/2024");

        stub.restore();
    });
});
