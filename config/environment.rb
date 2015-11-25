# Load the rails application.
require File.expand_path('../application', __FILE__)

app_passcodes = File.join(Rails.root, 'config', 'initializers', 'app_passcodes.rb')
load(app_passcodes) if File.exists?(app_passcodes)

# Initialize the rails application.
GobbleBreak::Application.initialize!
