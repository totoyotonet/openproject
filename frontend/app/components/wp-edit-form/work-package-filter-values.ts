import {HalResource} from '../api/api-v3/hal-resources/hal-resource.service';
import {CollectionResource} from '../api/api-v3/hal-resources/collection-resource.service';
import {FormResourceInterface} from '../api/api-v3/hal-resources/form-resource.service';
import {
  QueryFilterInstanceResource,
} from '../api/api-v3/hal-resources/query-filter-instance-resource.service';
import {WorkPackageResourceInterface} from '../api/api-v3/hal-resources/work-package-resource.service';

export class WorkPackageFilterValues {

  constructor(private workPackage:WorkPackageResourceInterface,
              private filters:QueryFilterInstanceResource[],
              private excluded:string[] = []) {

  }

  public applyDefaultsFromFilters() {
    return this.workPackage.getForm().then((form) => {
      const promises:Promise<any>[] = [];
      angular.forEach(this.filters, filter => {
        // Ignore any filters except =
        if (filter.operator.id !== '=') {
          return;
        }

        // Exclude filters specified in constructor
        if (this.excluded.indexOf(filter.id) !== -1) {
          return;
        }

        // Select the first value
        var value = filter.values[0];

        // Avoid empty values
        if (!value) {
          return;
        }

        promises.push(this.setAllowedValueFor(form, filter.id, value));
      });

      return Promise.all(promises);
    });
  }

  private setAllowedValueFor(form:FormResourceInterface, field:string, value:string | HalResource) {
    return this.allowedValuesFor(form, field).then((allowedValues) => {
      let newValue;

      if ((value as HalResource)['$href']) {
        newValue = _.find(allowedValues,
          (entry:any) => entry.$href === (value as HalResource).$href);
      } else if (allowedValues) {
        newValue = _.find(allowedValues, (entry:any) => entry === value);
      } else {
        newValue = value;
      }

      if (newValue) {
        this.workPackage[field] = newValue;
      }
    });
  }

  private allowedValuesFor(form:FormResourceInterface, field:string):Promise<HalResource[]> {
    const fieldSchema = form.schema[field];

    return new Promise(resolve => {
      if (!fieldSchema) {
        resolve([]);
      } else if (fieldSchema.allowedValues && fieldSchema.allowedValues['$load']) {
        let allowedValues = fieldSchema.allowedValues;

        return allowedValues.$load().then((loadedValues:CollectionResource) => {
          resolve(loadedValues.elements);
        });
      } else {
        resolve(fieldSchema.allowedValues);
      }
    });
  }
}
