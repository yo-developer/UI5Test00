namespace yo.test;
using { managed } from '@sap/cds/common';

  entity Entity1 : managed {
    key ID      : UUID  @(Core.Computed : true);
    title       : String not null;
    descr       : String;
    entities2   : Association to many Entity2 on entities2.entity1 = $self
  }

  entity Entity2 : managed {
    key ID      : UUID  @(Core.Computed : true);  
    title       : String not null;
    descr       : String;
    entity1     : Association to Entity1;
  }