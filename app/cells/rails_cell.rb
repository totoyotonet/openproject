class RailsCell < Cell::ViewModel
  include Escaped
  include ApplicationHelper
  include ActionView::Helpers::TranslationHelper
  include SecureHeaders::ViewHelpers

  self.view_paths = ['app/cells/views']

  # We don't include ActionView::Helpers wholesale because
  # this would override Cell's own render method and
  # subsequently break everything.

  def self.options(*names)
    names.each do |name|
      define_method(name) do
        options[name]
      end
    end
  end

  def show
    # Set the _request from AS::Controller that doesn't get passed into the rails cell.
    # Workaround for when using middlewares such as SecureHeaders that relies on it,
    # but don't use the request method itself.
    @_request = request

    render
  end

  def controller
    context[:controller]
  end

  def request
    controller.request
  end
end
