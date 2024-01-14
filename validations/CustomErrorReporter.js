import { errors } from "@vinejs/vine"

export class CustomErrorReporter {
  hasErrors = false
  errors = {}

  report(message, rule, field, meta) {
    this.hasErrors = true
    this.errors[field.wildCardPath] = message
  }

  /**
   * Creates and returns an instance of the
   * ValidationError class
   */
  createError() {
    return new errors.E_VALIDATION_ERROR(this.errors)
  }
}
