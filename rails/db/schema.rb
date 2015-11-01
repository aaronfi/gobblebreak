# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20140422062725) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"
  enable_extension "hstore"

  create_table "puzzle_viewings", force: :cascade do |t|
    t.integer  "user_id"
    t.integer  "puzzle_id"
    t.datetime "start_date"
    t.datetime "end_date"
    t.string   "replay_log"
    t.float    "num_seconds_viewed"
    t.float    "num_seconds_to_solve"
    t.boolean  "was_solved"
    t.boolean  "was_answer_asked_for"
    t.integer  "num_attempts"
    t.integer  "num_hints_used"
    t.integer  "level_of_hint_used"
    t.float    "user_current_rating"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "puzzle_viewings", ["puzzle_id"], name: "index_puzzle_viewings_on_puzzle_id", using: :btree
  add_index "puzzle_viewings", ["user_id"], name: "index_puzzle_viewings_on_user_id", using: :btree

  create_table "puzzles", force: :cascade do |t|
    t.string   "obsfucated_id",    limit: 8
    t.string   "fen",              limit: 128
    t.text     "movetext"
    t.text     "pgn"
    t.integer  "num_views"
    t.integer  "num_completions"
    t.integer  "num_ratings"
    t.float    "avg_rating"
    t.float    "difficulty_score"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "roles", force: :cascade do |t|
    t.string   "name"
    t.integer  "resource_id"
    t.string   "resource_type"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "roles", ["name", "resource_type", "resource_id"], name: "index_roles_on_name_and_resource_type_and_resource_id", using: :btree
  add_index "roles", ["name"], name: "index_roles_on_name", using: :btree

  create_table "users", force: :cascade do |t|
    t.string   "name"
    t.hstore   "preferences"
    t.string   "email",                  default: "", null: false
    t.string   "encrypted_password",     default: "", null: false
    t.string   "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer  "sign_in_count",          default: 0
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string   "current_sign_in_ip"
    t.string   "last_sign_in_ip"
    t.string   "confirmation_token"
    t.datetime "confirmed_at"
    t.datetime "confirmation_sent_at"
    t.string   "unconfirmed_email"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "oauth_token"
    t.datetime "oauth_expires_at"
    t.string   "provider"
    t.string   "uid"
    t.string   "image"
  end

  add_index "users", ["confirmation_token"], name: "index_users_on_confirmation_token", unique: true, using: :btree
  add_index "users", ["email"], name: "index_users_on_email", unique: true, using: :btree
  add_index "users", ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true, using: :btree

  create_table "users_roles", id: false, force: :cascade do |t|
    t.integer "user_id"
    t.integer "role_id"
  end

  add_index "users_roles", ["user_id", "role_id"], name: "index_users_roles_on_user_id_and_role_id", using: :btree

end
