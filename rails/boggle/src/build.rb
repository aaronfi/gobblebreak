#!/Users/aaron/.rvm/rubies/ruby-2.2.3/bin/ruby

require 'csv'
require 'pp'
#require 'debug'

freq_dict = {}

CSV.foreach("words_freq.csv") do |row|
  freq_dict[row[0]] = row[1]
end

File.open("words_ospd.txt", "r") do |f|
  f.each_line do |word|
  	word.chomp!
  	if freq_dict[word] then
	    puts word + "," + freq_dict[word]
  	else
  		puts word
  	end
  end
end