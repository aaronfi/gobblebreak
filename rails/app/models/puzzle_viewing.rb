# == Schema Information
#
# Table name: puzzle_viewings
#
#  id                   :integer          not null, primary key
#  user_id              :integer
#  puzzle_id            :integer
#  start_date           :datetime
#  end_date             :datetime
#  num_seconds_viewed   :float
#  num_seconds_to_solve :float
#  was_solved           :boolean
#  was_answer_asked_for :boolean
#  num_attempts         :integer
#  num_hints_used       :integer
#  level_of_hint_used   :integer
#  user_current_rating  :float
#  created_at           :datetime
#  updated_at           :datetime
#

class PuzzleViewing < ActiveRecord::Base
  belongs_to :user
  belongs_to :puzzle

  validates_numericality_of :num_attempts
end
