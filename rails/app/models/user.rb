# == Schema Information
#
# Table name: users
#
#  id                     :integer          not null, primary key
#  name                   :string(255)
#  created_at             :datetime
#  updated_at             :datetime
#  email                  :string(255)      default(""), not null
#  encrypted_password     :string(255)      default(""), not null
#  reset_password_token   :string(255)
#  reset_password_sent_at :datetime
#  remember_created_at    :datetime
#  sign_in_count          :integer          default(0)
#  current_sign_in_at     :datetime
#  last_sign_in_at        :datetime
#  current_sign_in_ip     :string(255)
#  last_sign_in_ip        :string(255)
#  confirmation_token     :string(255)
#  confirmed_at           :datetime
#  confirmation_sent_at   :datetime
#  unconfirmed_email      :string(255)

# TODO this schema comment dump is now out of date;  how do you regen?  forgot...
#

class User < ActiveRecord::Base
  # Include default devise modules. Others available are:
  # :token_authenticatable, :lockable, :timeoutable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable,
         :confirmable, :omniauthable, :omniauth_providers => [:google_oauth2, :facebook]
  rolify

  hstore_accessor :preferences,
      board_size:                            { data_type: :integer, store_key: 'a' },
      board_color_white:                     { data_type: :integer, store_key: 'b' },
      board_color_black:                     { data_type: :integer, store_key: 'c' },
      show_board_notation_inside:            { data_type: :boolean, store_key: 'd' },
      show_board_notation_outside:           { data_type: :boolean, store_key: 'e' },

      show_confirmation_of_correct_move:     { data_type: :boolean, store_key: 'g' },
      show_confirmation_of_incorrect_move:   { data_type: :boolean, store_key: 'h' },

      show_legal_moves_on_mousedrag:         { data_type: :boolean, store_key: 'i' },
      show_legal_moves_on_mouseover:         { data_type: :boolean, store_key: 'j' },

      show_puzzle_goal:                      { data_type: :boolean, store_key: 'k' },
      show_remaining_move_count:             { data_type: :boolean, store_key: 'l' },

      show_user_comments:                    { data_type: :boolean, store_key: 'm' },

      is_computer_enabled:                   { data_type: :boolean, store_key: 'n' },

      are_hints_enabled:                     { data_type: :boolean, store_key: 'o' },
      remove_incorrect_moves:                { data_type: :boolean, store_key: 'p' },
      show_correct_piece_to_move:            { data_type: :boolean, store_key: 'q' },
      show_correct_move:                     { data_type: :boolean, store_key: 'r' },

      show_possible_moves:                   { data_type: :boolean, store_key: 's' },

      show_move_timing:                      { data_type: :boolean, store_key: 't' },
      show_puzzle_timer:                     { data_type: :boolean, store_key: 'u' },
      show_puzzle_timer_thresholds:          { data_type: :boolean, store_key: 'v' },

      show_puzzle_stats_at_puzzle_end:       { data_type: :boolean, store_key: 'w' },
      show_puzzle_stats_at_puzzle_beginning: { data_type: :boolean, store_key: 'x' },

      show_moves_as_table:                   { data_type: :boolean, store_key: 'y' },
      show_moves_in_SAN:                     { data_type: :boolean, store_key: 'z' },
      show_moves_as_icons:                   { data_type: :boolean, store_key: 'A' };


  def self.from_omniauth(access_token)
      # update our database with the latest access_token info
      where(provider: access_token.provider, uid: access_token.uid).first_or_create do |user|
          user.email = access_token.info.email
          user.image = access_token.info.image
          user.name = access_token.info.name
          user.password = Devise.friendly_token[0,20]
          user.oauth_token = access_token.credentials.token
          user.oauth_expires_at = Time.at(access_token.credentials.expires_at)
          user.provider = access_token.provider
          user.uid = access_token.uid

          user.save!
      end
  end


  # https://github.com/plataformatec/devise/issues/1513
  # have Devise always remember users
  def remember_me
      true
  end

  # TODO(aaron, 4/22) eventually instate this;  also, figure out rpsec test writing.
  # validates :email, presence: true, format: { with: VALID_EMAIL_REGEX }, uniqueness: true

  # TODO aaronfi gut out, simplify all this cruft below and above

  ## Include default devise modules. Others available are:
  ## :token_authenticatable, :confirmable,
  ## :lockable, :timeoutable and :omniauthable
  #devise :database_authenticatable, :registerable,
  #       :recoverable, :rememberable, :trackable, :validatable
  #rolify
  ## Include default devise modules. Others available are:
  ## :token_authenticatable, :confirmable,
  ## :lockable, :timeoutable and :omniauthable
  #
  ## NOTE(aaronfi) took out devise :invitable -- wasn't defined.
  #devise :database_authenticatable, :registerable, :confirmable,
  #       :recoverable, :rememberable, :trackable, :validatable
  #
  ## Setup accessible (or protected) attributes for your model
  #attr_accessible :role_ids, :as => :admin
  #attr_accessible :name, :email, :password, :password_confirmation, :remember_me
  #
end
