import { expect, test } from "@jest/globals";
import { DateTime } from "../src/DateTime";
import { TimeZone } from "../src/TimeZone";

test("fromDateTime() epoch without ms or timezone", () => {
    const dt = DateTime.fromDateTime(1970, 1, 1, 0, 0, 0);
    expect(dt.timestamp).toEqual(0);
});

test("fromDateTime() epoch with ms without timezone", () => {
    const dt = DateTime.fromDateTime(1970, 1, 1, 0, 0, 0, 0);
    expect(dt.timestamp).toEqual(0);
});

test("fromDateTime() epoch with ms and timezone UTC", () => {
    const dt = DateTime.fromDateTime(1970, 1, 1, 0, 0, 0, 0, TimeZone.utc);
    expect(dt.timestamp).toEqual(0);
});

test("fromDateTime() epoch with ms and timezone America/New_York", () => {
    const dt = DateTime.fromDateTime(1970, 1, 1, 0, 0, 0, 0, new TimeZone("America/New_York"));
    expect(dt.timestamp).toEqual(18000000);
});

test("fromDateTime() with invalid year", () => {
    expect(() => {
        DateTime.fromDateTime(-1, 1, 1, 0, 0, 0);
    }).toThrow(/^Expected valid year, found -1.$/);
});

test("fromDateTime() with invalid month (0)", () => {
    expect(() => {
        DateTime.fromDateTime(1970, 0, 1, 0, 0, 0);
    }).toThrow(/^Expected valid month, found 0.$/);
});

test("fromDateTime() with invalid month (13)", () => {
    expect(() => {
        DateTime.fromDateTime(1970, 13, 1, 0, 0, 0);
    }).toThrow(/^Expected valid month, found 13.$/);
});

test("fromDateTime() with invalid month (-1)", () => {
    expect(() => {
        DateTime.fromDateTime(1970, -1, 1, 0, 0, 0);
    }).toThrow(/^Expected valid month, found -1.$/);
});
