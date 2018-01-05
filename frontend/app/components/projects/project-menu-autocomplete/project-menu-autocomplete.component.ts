//-- copyright
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
//++

import {PathHelperService} from 'core-components/common/path-helper/path-helper.service';
import {wpControllersModule} from '../../../angular-modules';

interface IAutocompleteItem {
  label:string;
  project:IProjectMenuEntry;
}

interface IProjectMenuEntry {
  id:number;
  name:string;
  identifier:string;
  has_children:boolean;
  level:number;
}

interface IQueryAutocompleteJQuery extends JQuery {
  projectMenuComplete({}):void;
}

export class ProjectMenuAutocompleteController {
  public text:any;

  // The project dropdown menu
  public dropdownMenu:JQuery;
  // The project filter input
  public input:IQueryAutocompleteJQuery;
  // No results element
  public noResults:JQuery;

  // The result set for the instance, loaded only once
  public results:null|IProjectMenuEntry[] = null;

  private maxItemsPerPage = 20;
  private currentPage = 1;
  private loaded = false;

  constructor(protected PathHelper:PathHelperService,
              protected $element:ng.IAugmentedJQuery,
              protected $q:ng.IQService,
              protected $window:ng.IWindowService,
              protected $http:ng.IHttpService,
              public I18n:op.I18n) {
    this.text = {
      label: I18n.t('js.projects.autocompleter.label'),
      no_results: I18n.t('js.select2.no_matches'),
      loading: I18n.t('js.ajax.loading')
    };

  }

  public $onInit() {
    this.dropdownMenu = this.$element.parents('li.drop-down');
    this.input = this.$element.find('.project-menu-autocomplete--input') as IQueryAutocompleteJQuery;
    this.noResults = angular.element('.project-menu-autocomplete--no-results');

    this.dropdownMenu.on('opened', () => this.open());
    this.dropdownMenu.on('closed', () => this.close());

  }


  public close() {
    this.input.projectMenuComplete('destroy');
    this.$element.find('.project-search-results').css('visibility', 'hidden');
  }

  public open() {
    this.$element.find('.project-search-results').css('visibility', 'visible');
    this.loadProjects().then((results:IProjectMenuEntry[]) => {
      let autocompleteValues = _.map(results, project => {
        return { label: project.name, project: project };
      });

      this.setupAutoCompletion(autocompleteValues);
      this.loaded = true;
    });
  }

  public get loadingText():string {
    if (this.loaded) {
      return '';
    } else {
      return this.text.loading;
    }
  }

  private loadProjects() {
    if (this.results !== null) {
      return this.$q.resolve(this.results);
    }

    const url = this.PathHelper.apiV2ProjectsList();
    return this.$http
      .get(url)
      .then((result:{ data:{ projects:IProjectMenuEntry[] } }) => {
        return this.results = result.data.projects;
      });
  }

  private setupAutoCompletion(autocompleteValues:IAutocompleteItem[]) {
    const ctrl = this;
    ctrl.currentPage = 0;
    this.defineJQueryQueryComplete();
    this.input.projectMenuComplete({
      delay: 0,
      source: autocompleteValues,
      select: (ul:any, selected:{ item:IAutocompleteItem }) => {
        this.goToProject(selected.item.project);
      },
      response: (event:any, ui:any) => {
        // Show the noResults span if we don't have any matches
        this.noResults.toggle(ui.content.length === 0);
      },
      appendTo: '.project-menu-autocomplete--wrapper',
      classes: {
        'ui-autocomplete': '-inplace project-menu-autocomplete--results'
      },
      autoFocus: true,
      minLength: 0
    });
  }

  /**
   * Return the number of (lazy) pages for the curent set of results
   * @param {IAutocompleteItem[]} items
   * @returns {number}
   */
  private pages(items:IAutocompleteItem[]):number {
    return Math.ceil(items.length / this.maxItemsPerPage);
  }

  /**
   * Returns whether the scrollbar is at a place where we should display additional elements
   * @param ul
   */
  private isScrollbarBottom(container:JQuery) {
    var height = container.outerHeight();
    var scrollHeight = container[0].scrollHeight;
    var scrollTop = container.scrollTop();
    return scrollTop >= (scrollHeight - height);
  }

  private defineJQueryQueryComplete() {
    // Need to reference controller within jQuery widget definitions
    let ctrl = this;

    jQuery.widget('custom.projectMenuComplete', jQuery.ui.autocomplete, {
      _create: function(this:any) {
        ctrl.currentPage = 0;
        this._super();
        this._search('');
      },

      _renderMenu: function (this:any, ul:Element, items:IAutocompleteItem[]) {
        let currentlyPublic:boolean;

        //remove scroll event to prevent attaching multiple scroll events to one container element
        jQuery(ul).unbind('scroll');

        this._renderLazyMenu(ul, items);
      },

      // Rener the menu for the current page
      _renderMenuPage(this:any, ul:Element, items:IAutocompleteItem[], page:number|null = null) {
        let widget = this;
        let pageElements = items;
        let max = ctrl.maxItemsPerPage;
        if (page !== null) {
          console.log("Rendering page " + page);
          pageElements = items.slice(page * max, (page * max) + max);
        }

        //append item to ul
        jQuery.each(pageElements, function (index, item) {
          widget._renderItemData(ul, item);
        });
      },

      _repositionMenu: function(this: any, container:JQuery) {
        const widget = this;
        const menu = widget.menu;

        menu.deactivate();
        menu.refresh();

        // size and position menu
        container.show();

        // Call ui's own resize
        widget._resizeMenu();

        container.position(jQuery.extend({ of: widget.element }, widget.options.position));
        if (widget.options.autoFocus) {
          menu.next(new jQuery.Event('mouseover'));
        }
      },

      // Resize the menu to keep max-height just below elements when more are available
      // Borrows from https://github.com/anseki/jquery-ui-autocomplete-scroll by anseki
      _resizeMenu: function() {
        var ul, lis, ulW, barW;
        if (isNaN(this.options.maxShowItems)) { return; }
        ul = this.menu.element
          .scrollLeft(0).scrollTop(0) // Reset scroll position
          .css({overflowX: '', overflowY: '', width: '', maxHeight: ''}); // Restore
        lis = ul.children('li').css('whiteSpace', 'nowrap');

        if (lis.length > this.options.maxShowItems) {
          ulW = ul.prop('clientWidth');
          ul.css({overflowX: 'hidden', overflowY: 'auto',
            maxHeight: lis.eq(0).outerHeight() * this.options.maxShowItems + 1}); // 1px for Firefox
          barW = ulW - ul.prop('clientWidth');
          ul.width('+=' + barW);
        }

        // Original code from jquery.ui.autocomplete.js _resizeMenu()
        ul.outerWidth(Math.max(
          ul.outerWidth() + 1,
          this.element.outerWidth()
        ));
      }

      _renderLazyMenu: function (this:any, ul:Element, items:IAutocompleteItem[]) {
        const widget = this;
        const container = jQuery(ul);
        const pages = ctrl.pages(items);

        if (pages <= 1) {
          return widget._renderMenuPage(ul, items);
        }

        widget._renderMenuPage(ul, items, 0);

        container.scroll(function () {
          if (ctrl.isScrollbarBottom(container)) {
            if (++ctrl.currentPage >= pages) {
              return;
            }

            // Render the current menu page
            widget._renderMenuPage(ul, items, ctrl.currentPage);

            // Reposition the menu
            widget._repositionMenu(container);
          }
        });
      }
    });
  }

  private goToProject(project:IProjectMenuEntry) {
    this.$window.location.href = this.PathHelper.projectPath(project.identifier);
  };
}

wpControllersModule.component('projectMenuAutocomplete', {
  templateUrl: '/components/projects/project-menu-autocomplete/project-menu-autocomplete.template.html',
  controller: ProjectMenuAutocompleteController
});

