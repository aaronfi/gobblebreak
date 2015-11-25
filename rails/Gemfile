source 'https://rubygems.org'
ruby '2.2.3'

## Gem versioning syntax examples
#
# ~> 2.0.0 == (>= 2.0.0 && < 2.1)
# ~> 2.1   == (>= 2.1   && < 3.0)

group :test, :development do

	# used to generate comments in each of your model files, documenting that model's underlying SQL schema;
    # you run this by
    # % cd ~/code/gobblebreak/rails
    # % annotate
	gem 'annotate'

  	gem 'byebug'   # lets you set debugging breakpoints by typing "byebug" in your code;  similar to Chrome's "debugger;" in javascript
  	gem 'konacha'
  	# gem 'teaspoon'
	# gem 'debugger'
  	gem 'poltergeist'
end

# per https://devcenter.heroku.com/articles/getting-started-with-rails4

gem 'devise'
gem 'omniauth'
gem 'omniauth-facebook'
gem 'omniauth-google-oauth2'

gem 'rails_12factor', group: :production   # https://devcenter.heroku.com/articles/getting-started-with-rails4#heroku-gems

gem 'closure-compiler'          # Google's Closure Compiler for javascript minimization and performance enhancements
gem 'font-awesome-rails'
gem 'foundation-rails'          # a CSS framework library, similar to Twitter's Bootstrap.  We're using it just for its rem-calc() function, nothing else.
gem 'hstore_accessor'           # for accessing Postgres hstore columns as objects
gem 'jquery-rails'              # use jquery as the JavaScript library
gem 'jquery-ui-rails', '~> 5.0' # use the jquery-ui library;  I'm just using 'jquery-ui/resizable' for now
gem 'pg'                        # use postgresql as the database for Active Record
gem 'rails', '4.2.4'            # bundle edge Rails instead: gem 'rails', github: 'rails/rails'
gem 'sass-rails', '~> 5.0'      # use SCSS for stylesheets. We are not using LESS.  We are using SCSS.

gem 'twitter-bootstrap-rails', :git => 'git://github.com/seyhunak/twitter-bootstrap-rails.git'

# Use unicorn as the app server
gem 'unicorn'
