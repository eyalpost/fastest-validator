"use strict";

const Validator = require("../../lib/validator");
const v = new Validator();

describe("Test rule: string", () => {

	it("should check type of value", () => {
		const check = v.compile({ $$root: true, type: "string" });
		const message = "The '' field must be a string.";

		expect(check(0)).toEqual([{ type: "string", actual: 0, message }]);
		expect(check(1)).toEqual([{ type: "string", actual: 1, message }]);
		expect(check([])).toEqual([{ type: "string", actual: [], message }]);
		expect(check({})).toEqual([{ type: "string", actual: {}, message }]);
		expect(check(false)).toEqual([{ type: "string", actual: false, message }]);
		expect(check(true)).toEqual([{ type: "string", actual: true, message }]);

		expect(check("")).toEqual(true);
		expect(check("test")).toEqual(true);
	});

	it("check empty values", () => {
		const check = v.compile({ $$root: true, type: "string", empty: false });

		expect(check("abc")).toEqual(true);
		expect(check("")).toEqual([{ type: "stringEmpty", actual: "", message: "The '' field must not be empty." }]);
	});

	it("check min length", () => {
		const check = v.compile({ $$root: true, type: "string", min: 5 });

		expect(check("John")).toEqual([{ type: "stringMin", expected: 5, actual: 4, message: "The '' field length must be greater than or equal to 5 characters long." }]);
		expect(check("Icebob")).toEqual(true);
	});

	it("check max length", () => {
		const check = v.compile({ $$root: true, type: "string", max: 5 });

		expect(check("John")).toEqual(true);
		expect(check("Icebob")).toEqual([{ type: "stringMax", expected: 5, actual: 6, message: "The '' field length must be less than or equal to 5 characters long." }]);
	});

	it("check fix length", () => {
		const check = v.compile({ $$root: true, type: "string", length: 6 });

		expect(check("John")).toEqual([{ type: "stringLength", expected: 6, actual: 4, message: "The '' field length must be 6 characters long." }]);
		expect(check("Icebob")).toEqual(true);
	});

	it("check pattern", () => {
		const check = v.compile({ $$root: true, type: "string", pattern: /^[A-Z]+$/ });

		expect(check("John")).toEqual([{ type: "stringPattern", expected: "/^[A-Z]+$/", actual: "John", message: "The '' field fails to match the required pattern." }]);
		expect(check("JOHN")).toEqual(true);
	});

	it("check pattern with string", () => {
		const check = v.compile({ $$root: true, type: "string", pattern: "^[A-Z]+$", patternFlags: "g" });

		expect(check("John")).toEqual([{ type: "stringPattern", expected: "/^[A-Z]+$/g", actual: "John", message: "The '' field fails to match the required pattern." }]);
		expect(check("JOHN")).toEqual(true);
	});

	it("check contains", () => {
		const check = v.compile({ $$root: true, type: "string", contains: "bob" });

		expect(check("John")).toEqual([{ type: "stringContains", expected: "bob", actual: "John", message: "The '' field must contain the 'bob' text." }]);
		expect(check("Icebob")).toEqual(true);
	});

	it("check enum", () => {
		const check = v.compile({ $$root: true, type: "string", enum: ["male", "female"] });
		const message = "The '' field does not match any of the allowed values.";

		expect(check("")).toEqual([{ type: "stringEnum", expected: "male, female", actual: "", message }]);
		expect(check("human")).toEqual([{ type: "stringEnum", expected: "male, female", actual: "human", message }]);
		expect(check("male")).toEqual(true);
		expect(check("female")).toEqual(true);
	});

	it("check numeric string", () => {
		const check = v.compile({ $$root: true, type: "string", numeric: true});
		const message = "The '' field must be a numeric string.";

		expect(check("123.1s0")).toEqual([{type: "stringNumeric", actual: "123.1s0", message }]);
		expect(check("x")).toEqual([{type: "stringNumeric", actual: "x", message }]);
		expect(check("")).toEqual([{type: "stringNumeric", actual: "", message }]);
		expect(check(" ")).toEqual([{type: "stringNumeric", actual: " ", message }]);

		expect(check("123")).toEqual(true);
		expect(check("-123")).toEqual(true);
		expect(check("123.10")).toEqual(true);
		expect(check("-123.10")).toEqual(true);
	});

	it("check alphabetic string", () => {
		const check = v.compile({ $$root: true, type: "string", alpha: true});
		const message = "The '' field must be an alphabetic string.";

		expect(check("3312")).toEqual([{type: "stringAlpha", actual: "3312", message }]);
		expect(check("h3ll0")).toEqual([{type: "stringAlpha", actual: "h3ll0", message }]);
		expect(check("us3rnam3")).toEqual([{type: "stringAlpha", actual: "us3rnam3", message }]);

		expect(check("username")).toEqual(true);
		expect(check("hello")).toEqual(true);
		expect(check("elliot")).toEqual(true);

	});

	it("check alphanumeric string", () => {
		const check = v.compile({ $$root: true, type: "string", alphanum: true});
		const message = "The '' field must be an alphanumeric string.";

		expect(check("hello_world")).toEqual([{type: "stringAlphanum", actual: "hello_world", message }]);
		expect(check("print()")).toEqual([{type: "stringAlphanum", actual: "print()", message }]);
		expect(check("user.name")).toEqual([{type: "stringAlphanum", actual: "user.name", message }]);

		expect(check("p4ssword")).toEqual(true);
		expect(check("anarchy77")).toEqual(true);
	});

	it("check alphadash string", () => {
		const check = v.compile({ $$root: true, type: "string", alphadash: true});
		const message = "The '' field must be an alphadash string.";

		expect(check("hello world")).toEqual([{type: "stringAlphadash", actual: "hello world", message }]);
		expect(check("hello.world")).toEqual([{type: "stringAlphadash", actual: "hello.world", message }]);
		expect(check("spaced string")).toEqual([{type: "stringAlphadash", actual: "spaced string", message }]);


		expect(check("hello_world")).toEqual(true);
		expect(check("dashed_string")).toEqual(true);

	});

	describe("Test sanitization", () => {

		it("should trim", () => {
			const check = v.compile({ username: { type: "string", trim: true, max: 6 } });

			let obj = { username: "   icebob  " };
			expect(check(obj)).toEqual(true);
			expect(obj).toEqual({ username: "icebob" });
		});

		it("should left trim", () => {
			const check = v.compile({ username: { type: "string", trimLeft: true } });

			let obj = { username: "   icebob  " };
			expect(check(obj)).toEqual(true);
			expect(obj).toEqual({ username: "icebob  " });
		});

		it("should right trim", () => {
			const check = v.compile({ username: { type: "string", trimRight: true } });

			let obj = { username: "   icebob  " };
			expect(check(obj)).toEqual(true);
			expect(obj).toEqual({ username: "   icebob" });
		});

		it("should left padding", () => {
			const check = v.compile({ username: { type: "string", padStart: 5 } });

			let obj = { username: "icebob" };
			expect(check(obj)).toEqual(true);
			expect(obj).toEqual({ username: "icebob" });

			obj = { username: "bob" };
			expect(check(obj)).toEqual(true);
			expect(obj).toEqual({ username: "  bob" });
		});

		it("should right padding", () => {
			const check = v.compile({ username: { type: "string", padEnd: 5, padChar: "." } });

			let obj = { username: "icebob" };
			expect(check(obj)).toEqual(true);
			expect(obj).toEqual({ username: "icebob" });

			obj = { username: "bob" };
			expect(check(obj)).toEqual(true);
			expect(obj).toEqual({ username: "bob.." });
		});

		it("should lowercase", () => {
			const check = v.compile({ username: { type: "string", lowercase: true } });

			let obj = { username: "IceBob" };
			expect(check(obj)).toEqual(true);
			expect(obj).toEqual({ username: "icebob" });
		});

		it("should uppercase", () => {
			const check = v.compile({ username: { type: "string", uppercase: true } });

			let obj = { username: "IceBob" };
			expect(check(obj)).toEqual(true);
			expect(obj).toEqual({ username: "ICEBOB" });
		});

		it("should localelowercase", () => {
			const check = v.compile({ username: { type: "string", localeLowercase: true } });

			let obj = { username: "Ájsz" };
			expect(check(obj)).toEqual(true);
			expect(obj).toEqual({ username: "ájsz" });
		});

		it("should localeuppercase", () => {
			const check = v.compile({ username: { type: "string", localeUppercase: true } });

			let obj = { username: "ájsz" };
			expect(check(obj)).toEqual(true);
			expect(obj).toEqual({ username: "ÁJSZ" });
		});
	});

});
