import {WorkPackageResourceInterface} from '../api/api-v3/hal-resources/work-package-resource.service';
import {WorkPackageEditForm} from '../wp-edit-form/work-package-edit-form';
import {TableRowEditContext} from '../wp-edit-form/table-row-edit-context';

export class WorkPackageTableEditingContext {
  public forms:{[wpId:string]:WorkPackageEditForm} = {};

  public reset() {
    _.each(this.forms, (form) => form.destroy());
    this.forms = {};
  }

  public stopEditing(workPackageId:string) {
    const existing = this.forms[workPackageId];
    if (existing) {
      existing.workPackage.resetAllCanges();
      existing.destroy();
      delete this.forms[workPackageId];
    }
  }

  public startEditing(workPackage:WorkPackageResourceInterface, classIdentifier:string):WorkPackageEditForm {
    const wpId = workPackage.id;
    const existing = this.forms[wpId];
    if (existing) {
      return existing;
    }

    // Get any existing edit state for this work package
    const editContext = new TableRowEditContext(wpId, classIdentifier);
    return this.forms[wpId] = WorkPackageEditForm.createInContext(editContext, workPackage, false);
  }
}

