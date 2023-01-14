import Joi, { ObjectSchema } from "joi";

const signupSchema: ObjectSchema = Joi.object().keys({
    username: Joi.string().required().min(3).max(15).messages({
        "string.base": "Username must be of type string",
        "string.min":
            "Username must be at least 3 characters and max 15 characters",
        "string.max":
            "Username must be at least 3 characters and max 15 characters",
        "string.empty": "Username is required",
    }),
    password: Joi.string().required().min(3).max(15).messages({
        "string.min":
            "Password must be at least 3 characters and max 15 characters",
        "string.max":
            "Password must be at least 3 characters and max 15 characters",
        "string.empty": "Password is required",
    }),
    email: Joi.string().required().email().messages({
        "string.base": "Email must be of type string",
        "string.email": "Email mus be valid",
        "string.empty": "Email is required",
    }),
    avatarColor: Joi.string().required().messages({
        "any.required": "Avatar color is required",
    }),
    avatarImage: Joi.string().required().messages({
        "any.required": "Avatar image is required",
    }),
});

export { signupSchema };
