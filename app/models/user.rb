# == Schema Information
#
# Table name: users
#
#  id                     :integer          not null, primary key
#  name                   :string
#  preferences            :hstore
#  email                  :string           default(""), not null
#  encrypted_password     :string           default(""), not null
#  reset_password_token   :string
#  reset_password_sent_at :datetime
#  remember_created_at    :datetime
#  sign_in_count          :integer          default(0)
#  current_sign_in_at     :datetime
#  last_sign_in_at        :datetime
#  current_sign_in_ip     :string
#  last_sign_in_ip        :string
#  confirmation_token     :string
#  confirmed_at           :datetime
#  confirmation_sent_at   :datetime
#  unconfirmed_email      :string
#  created_at             :datetime
#  updated_at             :datetime
#  oauth_token            :string
#  oauth_expires_at       :datetime
#  provider               :string
#  uid                    :string
#  image                  :string
#

class User < ActiveRecord::Base
  # Include default devise modules. Others available are:
  # :token_authenticatable, :lockable, :timeoutable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable,
         :confirmable, :omniauthable, :omniauth_providers => [:google_oauth2, :facebook]

  # hstore_accessor :preferences,
  #     board_size:                            { data_type: :integer, store_key: 'a' },
  #     board_color_white:                     { data_type: :integer, store_key: 'b' },

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

          user.skip_confirmation!
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
