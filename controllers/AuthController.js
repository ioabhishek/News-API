import prisma from "../DB/db.config.js"
import vine, { errors } from "@vinejs/vine"
import { loginSchema, registerSchema } from "../validations/authValidation.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

class AuthController {
  static async register(req, res) {
    try {
      const body = req.body
      const validator = vine.compile(registerSchema)
      const payload = await validator.validate(body)

      const findUser = await prisma.users.findUnique({
        where: {
          email: payload.email,
        },
      })

      if (findUser) {
        return res.status(400).json({
          errors: {
            email:
              "Email already exists. Please try again with another email address",
          },
        })
      }

      // Encrypt the password
      const salt = bcrypt.genSaltSync(10)
      payload.password = bcrypt.hashSync(payload.password, salt)

      const user = await prisma.users.create({
        data: payload,
      })

      return res.json({
        status: 200,
        message: "user created successfully",
        user,
      })
    } catch (error) {
      console.log("error creating user", error)
      if (error instanceof errors.E_VALIDATION_ERROR) {
        // console.log(error.messages)
        return res.status(400).json({ error: error.message })
      } else {
        return res.status(500).json({
          status: 500,
          message: "Something went wrong. Please try again.",
        })
      }
    }
  }

  static async login(req, res) {
    try {
      const body = req.body
      const validator = vine.compile(loginSchema)
      const payload = await validator.validate(body)

      // find user
      const findUser = await prisma.users.findUnique({
        where: {
          email: payload.email,
        },
      })

      if (findUser) {
        if (!bcrypt.compareSync(payload.password, findUser.password)) {
          return res.status(400).json({
            errors: {
              email: "Invalid Credentials.",
            },
          })
        }

        // Issue token to user
        const payloadData = {
          id: findUser.id,
          name: findUser.name,
          email: findUser.email,
          profile: findUser.profile,
        }
        const token = jwt.sign(payloadData, process.env.JWT_SECRET, {
          expiresIn: "365d",
        })

        return res.json({
          message: "Logged in",
          access_token: `Bearer ${token}`,
        })
      }

      return res.status(400).json({
        errors: {
          email: "No user found with this mail",
        },
      })
    } catch (error) {
      console.log("error creating user", error)
      if (error instanceof errors.E_VALIDATION_ERROR) {
        // console.log(error.messages)
        return res.status(400).json({ error: error.message })
      } else {
        return res.status(500).json({
          status: 500,
          message: "Something went wrong. Please try again.",
        })
      }
    }
  }
}

export default AuthController