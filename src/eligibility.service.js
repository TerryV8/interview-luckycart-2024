class EligibilityService {
  /**
   * Checks if all the specified conditions are met by a given cart value.
   *
   * @param value - The cart value to be checked against the conditions.
   * @param conditions - An object containing various conditions.
   * @return {boolean} True if all conditions are met, false otherwise.
   */
  isAllConditionsMet(value, conditions) {
    for (const conditionKey in conditions) {
      const conditionObject = { [conditionKey]: conditions[conditionKey] };

      if (!this.isCriterionMet(value, conditionObject)) return false;
    }
    return true;
  }

  /**
   * Checks if any of the specified conditions are met by a given cart value.
   *
   * @param value - The cart value to be checked against the conditions.
   * @param conditions - An object containing various conditions.
   * @return {boolean} True if any condition is met, false otherwise.
   */
  isAnyConditionMet(value, conditions) {
    for (const conditionKey in conditions) {
      const conditionObject = { [conditionKey]: conditions[conditionKey] };

      if (this.isCriterionMet(value, conditionObject)) return true;
    }
    return false;
  }

  /**
   * Evaluates if a given cart value meets a specified criterion value.
   *
   * @param value - The cart value to be checked.
   * @param criterion - An object representing a single criterion value.
   * @return {boolean} True if the criterion is met, false otherwise.
   */
  isCriterionMet(value, criterion) {
    if (value === undefined) return false;
    if (typeof criterion !== "object") {
      return value.toString() === criterion.toString();
    }

    for (const conditionKey in criterion) {
      const conditionValue = criterion[conditionKey];

      switch (conditionKey) {
        case "gt":
          if (!(conditionValue < value)) return false;
          break;
        case "lt":
          if (!(conditionValue > value)) return false;
          break;
        case "eq":
          if (!(conditionValue.toString() === value.toString())) return false;
          break;
        case "gte":
          if (!(conditionValue <= value)) return false;
          break;
        case "lte":
          if (!(conditionValue >= value)) return false;
          break;
        case "in":
          if (!conditionValue.includes(value)) return false;
          break;
        case "and":
          if (!this.isAllConditionsMet(value, conditionValue)) return false;
          break;
        case "or":
          if (!this.isAnyConditionMet(value, conditionValue)) return false;
          break;
        default:
          return false; //unrecognized condition
      }
    }

    return true;
  }

  /**
   * Compare cart data with criteria to compute eligibility.
   * If all criteria are fulfilled then the cart is eligible (return true).
   *
   * @param cart
   * @param criteria
   * @return {boolean}
   */
  isEligible(cart, criteria) {
    for (const key in criteria) {
      //Handled nested criteria
      if (key.includes(".")) {
        if (!this.IsNestedEligible(cart, key, criteria[key])) {
          return false;
        }

        //Handle non-nested criteria
      } else if (!this.isCriterionMet(cart[key], criteria[key])) return false;
    }

    return true;
  }

  /**
   * Evaluates nested criteria for eligibility.
   *
   * @param cart - The cart object to be evaluated.
   * @param nestedKey - The nested key, when there is a "." in the key name.
   * @param subCriteria - The criteria value on this nested key.
   * @return {boolean} True if the nested criteria are met, false otherwise.
   */

  IsNestedEligible(cart, nestedKey, subCriteria) {
    const cartPath = nestedKey.split(".");
    let nestedValue = cart;

    for (let i = 0; i < cartPath.length - 1; i++) {
      if (nestedValue === undefined) return false;
      nestedValue = nestedValue[cartPath[i]];
    }

    if (nestedValue === undefined) return false;

    // If the path leads to an array, check if any of the elements meet the criterion
    if (Array.isArray(nestedValue)) {
      return nestedValue.some((element) =>
        this.isCriterionMet(element[cartPath[cartPath.length - 1]], subCriteria)
      );
    }

    // Otherwise, when it is not an array
    return this.isCriterionMet(
      nestedValue[cartPath[cartPath.length - 1]],
      subCriteria
    );
  }
}

module.exports = {
  EligibilityService,
};
