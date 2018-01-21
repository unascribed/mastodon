# frozen_string_literal: true

class ProcessHashtagsService < BaseService
  def call(status, tags = [])
    status_text = status.local? && status.full_status_text? ? status.full_status_text : status.text
    tags = Extractor.extract_hashtags(status_text) if status.local?

    tags.map { |str| str.mb_chars.downcase }.uniq(&:to_s).each do |tag|
      status.tags << Tag.where(name: tag).first_or_initialize(name: tag)
    end

    status.update(sensitive: true) if tags.include?('nsfw')
  end
end
