// -- copyright
// OpenProject is a project management system.
// Copyright (C) 2012-2015 the OpenProject Foundation (OPF)
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License version 3.
//
// OpenProject is a fork of ChiliProject, which is a fork of Redmine. The copyright follows:
// Copyright (C) 2006-2013 Jean-Philippe Lang
// Copyright (C) 2010-2013 the ChiliProject Team
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation; either version 2
// of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
//
// See doc/COPYRIGHT.rdoc for more details.
// ++

import {HalResource} from '../../api/api-v3/hal-resources/hal-resource.service';

function lazy(obj:HalResource, property:string, getter:{ ():any }, setter?:{ (value:any):void }):void {
  if (angular.isObject(obj)) {
    let done = false;
    let cached:any;
    let config:any = {
      get() {
        if (!!obj.changeset && obj.changeset.isChanged(property)) {
          return obj.changeset.entries[property].newValue;
        }
        if (!done) {
          cached = getter();
          done = true;
        }
        return cached;
      },
      set: ():void => undefined,

      configurable: true,
      enumerable: true
    };

    if (setter) {
      config.set = (val:any) => {
        let newValue = setter(val);

        if (!!obj.changeset) {
          let oldValue = getter();
          obj.changeset.setValue(property, oldValue, newValue);
          obj.onValueChanged(property, oldValue, newValue);
        } else {
          cached = newValue;
          done = true;
        }
      };
    }

    Object.defineProperty(obj, property, config);
  }
}

angular
  .module('openproject.services')
  .factory('lazy', () => lazy);

