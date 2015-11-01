# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)

#   TODO(aaron,2013.03.27) add your initial inserts here
#
#   INSERT INTO account_status (status) values ('active');
#   INSERT INTO account_status (status) values ('deleted');
#   INSERT INTO account_type (account_type) values ('admin');
#   INSERT INTO account_type (account_type) values ('user');
#   INSERT INTO account_type (account_type) values ('moderator');
#   SELECT add_tag('problem-types');
#   SELECT add_tag('problem-types', ARRAY['helpmate', 'selfmate', 'stalemate', 'mating', 'retrograde-analysis']);
#   SELECT add_tag('selfmate', ARRAY['reflexmate', 'semi-reflexmate']);
#   SELECT add_tag('mating', ARRAY['mate-in-1', 'mate-in-2', 'mate-in-3', 'mate-in-4', 'mate-in-5', 'mate-in-6', 'mate-in-7', 'mate-in-8', 'mate-in-9', 'mate-in-10+']);
#   SELECT redirect_tag('retros', 'retrograde-analysis');
#   SELECT redirect_tag('checkmate', 'mating');
#   SELECT redirect_tag('checkmating', 'mating');
#   DROP FUNCTION add_tag(varchar(63));
#   DROP FUNCTION add_tag(varchar(63), varchar(63)[]);
#   DROP FUNCTION redirect_tag(varchar(63), varchar(63));

Puzzle.delete_all
Puzzle.create(fen: '3n2k1/5p1p/5P1P/8/8/8/8/QRR4K w - - 0 1',
              movetext: '1. Rb8 ( 1. Qa8 Kh8 ( 1... Kf8 2. Qxd8# ) 2. Qxd8# ) ( 1. Rc8 Kh8 ( 1... Kf8 2. Rxd8# ) 2. Rxd8# ) 1... Kh8 ( 1... Kf8 2. Rxd8# ) 2. Rxd8# 1-0',
              pgn: '[Event "Edited position"]
               [Site "US-SEA-R82K76F"]
               [Date "2012.07.05"]
               [Round "-"]
               [White "-"]
               [Black "-"]
               [Result "1-0"]
               [ChessCat "CHESSCAT 1.0"]
               [FEN "3n2k1/5p1p/5P1P/8/8/8/8/QRR4K w - - 0 1"]
               [PlyCount "3"]
               [Setup "1"]
               ')

puts 'ROLES'
%w(admin moderator).each do |role|
  Role.create name: role
  puts 'role: ' << role
end
puts 'DEFAULT USERS'
user = User.create name: "GobbleBreak Admin", email: "support@GobbleBreak.com", password: "foobar", password_confirmation: "foobar"

puts 'user: ' << user.name

user.add_role :admin
user.save
