import { Injectable } from '@nestjs/common';
import { InfoRepository } from './info.repository';

@Injectable()
export class InfoService {
  constructor(private readonly infoRepository: InfoRepository) {}
  async search(query: string, criteria: string) {
    switch (criteria) {
      case 'title':
        return this.infoRepository.searchByTitle(query);
      case 'author':
        return this.infoRepository.searchByAuthor(query);
      case 'all':
      default:
        return this.infoRepository.searchByAll(query);
    }
  }
}
