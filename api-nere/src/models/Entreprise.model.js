// Représentation d'une entreprise issue de la base SQL Server NERE
// Pas de Mongoose ici — données SQL Server via mssql
class Entreprise {
  constructor(row) {
    this.rccm        = row.RCCM;
    this.ifu         = row.IFU;
    this.nom         = row.NOM_ENTREPRISE;
    this.secteur     = row.SECTEUR;
    this.region      = row.REGION;
    this.ville       = row.VILLE;
    this.ca          = row.CHIFFRE_AFFAIRES;
    this.effectif    = row.EFFECTIF;
    this.dateCreation = row.DATE_CREATION;
    this.statut      = row.STATUT;
  }
}
module.exports = Entreprise;
