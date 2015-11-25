# == Schema Information
#
# Table name: game_sessions
#
#  id         :integer          not null, primary key
#  user_id    :integer
#  session_id :string
#  game_url   :text
#  event_log  :text
#  created_at :datetime
#  updated_at :datetime
#
class GameSession < ActiveRecord::Base
    belongs_to :user
end
