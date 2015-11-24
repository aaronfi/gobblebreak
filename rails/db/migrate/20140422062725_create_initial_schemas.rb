class CreateInitialSchemas < ActiveRecord::Migration
  def change

    enable_extension 'hstore'

    ## Here are all the Rails 4 (ActiveRecord migration) datatypes:
    #
    # :binary
    # :boolean
    # :date
    # :datetime
    # :decimal
    # :float
    # :integer
    # :primary_key
    # :references
    # :string
    # :text
    # :time
    # :timestamp
    #
    # If you use PostgreSQL, you can also take advantage of these:
    #
    # :hstore
    # :json
    # :array
    # :cidr_address
    # :ip_address
    # :mac_address
    #
    # Source: http://api.rubyonrails.org/classes/ActiveRecord/ConnectionAdapters/TableDefinition.html#method-i-column

    # Because you've been manually editing this initial migrations file by hand, instead of creating a new migration
    # file for each change you want to try out, here are the steps you need to take to get your schema changes
    # in this file to actually be applied to the databse:  (Rails, by default, doesn't replay all migrations, it just
    # uses the latest snapshot in schema.rb)
    #
    # (1) rm ~/code/gobblebreak/rails/db/schema.rb
    # (2) rake db:reset
    #
    # See http://stackoverflow.com/questions/10301794/difference-between-rake-dbmigrate-dbreset-and-dbschemaload

    create_table :users do |t|
      t.string :name
      t.hstore :preferences

      ## Database authenticatable
      t.string :email,              :null => false, :default => ''
      t.string :encrypted_password, :null => false, :default => ''

      ## Recoverable
      t.string   :reset_password_token
      t.datetime :reset_password_sent_at

      ## Rememberable
      t.datetime :remember_created_at

      ## Trackable
      t.integer  :sign_in_count, :default => 0
      t.datetime :current_sign_in_at
      t.datetime :last_sign_in_at
      t.string   :current_sign_in_ip
      t.string   :last_sign_in_ip

      ## Confirmable
      t.string   :confirmation_token
      t.datetime :confirmed_at
      t.datetime :confirmation_sent_at
      t.string   :unconfirmed_email # Only if using reconfirmable

      ## Lockable
      # t.integer  :failed_attempts, :default => 0 # Only if lock strategy is :failed_attempts
      # t.string   :unlock_token # Only if unlock strategy is :email or :both
      # t.datetime :locked_at

      ## Token authenticatable
      # t.string :authentication_token

      t.timestamps

      # Omniauth
      t.string :oauth_token
      t.datetime :oauth_expires_at
      t.string :provider
      t.string :uid
      t.string :image
    end

    create_table :game_sessions do |t|
      t.references :user, index: true
      t.text :game_url
      t.text :event_log

      t.timestamps
    end

    add_index :users, :email,                :unique => true
    add_index :users, :reset_password_token, :unique => true
    add_index :users, :confirmation_token,   :unique => true
    # add_index :users, :unlock_token,         :unique => true
    # add_index :users, :authentication_token, :unique => true
  end
end
