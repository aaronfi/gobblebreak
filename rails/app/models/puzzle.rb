# == Schema Information
#
# Table name: puzzles
#
#  id               :integer          not null, primary key
#  obsfucated_id    :string(8)
#  fen              :string(128)
#  movetext         :text
#  pgn              :text
#  num_views        :integer
#  num_completions  :integer
#  num_ratings      :integer
#  avg_rating       :float
#  difficulty_score :float
#  created_at       :datetime
#  updated_at       :datetime
#

class Puzzle < ActiveRecord::Base
  belongs_to :user

  validates_presence_of :movetext, :pgn
  validates_uniqueness_of :obsfucated_id
end
