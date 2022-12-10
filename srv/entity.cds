using {yo.test as my} from '../db/schema';

@path : 'service/entity'
service EstityService {
    entity Entity1 as projection on my.Entity1;
    //annotate Entity1 with @odata.draft.enabled;
    entity Entity2 as projection on my.Entity2;
    //annotate Entity1 with @odata.draft.enabled;
}
