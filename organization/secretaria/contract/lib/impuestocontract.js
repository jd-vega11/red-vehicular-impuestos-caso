/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';

// Fabric smart contract classes
const { Contract, Context } = require('fabric-contract-api');

// Clases especificas de nuestra red vehicular
const Impuesto = require('./impuesto.js');
const ImpuestoList = require('./impuestolist.js');

/**
 * Tarifas por aplicar sobre la base gravable del vehículo.
 * Se utilizan para calcular el valor a pagar cuando se genera el impuesto en la transacción.
 * PARTICULAR_1 = Avalúo de hasta $ 46.630.000
 * PARTICULAR_2 = Avalúo desde $46.630.000 y hasta $104.916.000	 
 * PARTICULAR_3 = Avalúo de más de $104.916.000	
 * MOTOCICLETAS = De más de 125 cm3 - Todos los avalúos
 * PUBLICOS = Todos los vehículos - Todos los avalúos
 */ 
const tarifas = {
    PARTICULAR_1: 0.015,
    PARTICULAR_2: 0.025,
    PARTICULAR_3: 0.035,
    MOTOCICLETA: 0.015,
    PUBLICO: 0.005
};

// Tipos de vehículo
const tiposVehiculo = {
    PARTICULAR: 1,
    MOTOCICLETA: 2,
    PUBLICO: 3
};


/**
 * Un contexto personalizado proporciona un fácil acceso a la lista de todos los impuestos
 */
class ImpuestoContext extends Context {

    constructor() {
        super();
        // Todos los impuestos se guardan en la lista que se crea a continuación
        this.impuestoList = new ImpuestoList(this);
    }

}

/**
 * 
 * Se define el contrato inteligente del impuesto extendiendo la clase Contract de Fabric.
 */
class ImpuestoContract extends Contract {

    constructor() {
        // Espacio único de nombres
        super('org.redvehicular.impuesto');
    }

    /**
     * Creación del contexto
    */
    createContext() {
        return new ImpuestoContext();
    }

    /**
     * Instantiate to perform any setup of the ledger that might be required.
     * @param {Context} ctx the transaction context
     */
    async instantiate(ctx) {
        // No implementation required with this example
        // It could be where data migration is performed, if necessary
        console.log('Instantiate the contract');
    }

    /**
     * Transacción para generar un nuevo impuesto
     *
     * @param {Context} ctx El contexto de la transacción
     * @param {String} placa La placa del vehículo sobre el cual se genera el impuesto
     * @param {String} tipoDoc El tipo de documento del propietario
     * @param {String} numDoc El número de documento del propietario 
     * @param {String} anioPagar El año que se va a pagar con este impuesto
     * @param {Integer} baseGravable Es el valor del vehículo establecido anualmente por el Ministerio de Transporte.
     * @param {Integer} tipoVehiculo Corresponde al tipo del vehículo (particular, público o motocicleta).
     * @param {Integer} avaluo Corresponde al valor del avaluo del vehículo en pesos colombianos.
    */
    async generar(ctx, placa, tipoDoc, numDoc, anioPagar, baseGravable, tipoVehiculo, avaluo) {

        //Captura la fecha actual
        let date = new Date();
        let fechaGen = date.yyyymmdd();

        //TODO: Considerando los lineamientos proporcionados en la página web de la Secretaria Distrital de Hacienda
        //haga el cálculo del valor del impuesto utilizando los parámetros que tiene la función y las constantes definidas al inicio del documento.

        //TODO: Genere la referencia de pago como un número aleatorio

        //TODO:Cree una instancia del impuesto. Puede guiarse con el ejemplo a continuación:
        //let impuesto = Impuesto.createInstance(placa,tipoDoc,numDoc,fechaGen,anioPagar,valor,refPago);
        
        // TODO: Utilice el metodo correspondiente para definir el estado del impuesto como GENERADO
        // Es necesario hacer este paso desde el Smart Contract, porque este controla la transición entre estados del ciclo de vida
       

        //Se agrega el impuesto a la lista de impuestos en el estado del mundo del ledger.
        await ctx.impuestoList.addImpuesto(impuesto);

        // Se debe retornar un impuesto serializado
        return impuesto.toBuffer();
    }

    /**
     * Transacción para pagar un impuesto
     *
     * @param {Context} ctx El contexto de la transacción
     * @param {String} placa La placa del vehículo sobre el cual se genera el impuesto
     * @param {String} anioPagar El año que se va a pagar con este impuesto
     * @param {String} banco Banco donde se realiza el pago
    */
    async pagar(ctx, placa, anioPagar, banco) {

        // Se recupera el impuesto correspondiente con las propiedades que conforman su llave única
        let impuestoKey = Impuesto.makeKey([placa, anioPagar]);
        let impuesto = await ctx.impuestoList.getImpuesto(impuestoKey);

        //TODO:

        // 1. Haga la transicion de estado de GENERADO a PAGADO
        //No olvide verificar el estado anterior para garantizar la consistencia
        //Al hacer lo anterior evita que, por ejemplo, se pueda pagar dos veces.

        //Lance la siguiente excepcion en caso de que el impuesto se encuentre en un estado distinto a GENERADO:
        //throw new Error('No es posible pagar el impuesto. El estado actual: ' +impuesto.getCurrentState()+ ' es inconsistente');

        // 2. Actualice el banco donde se realizó la transacción usando el método correspondiente.
        // 3. Actualice la fecha de pago usando el método correspondiente
     

        // Se actualiza el impuesto en el estado del mundo del ledger
        await ctx.impuestoList.updateImpuesto(impuesto);

        //Se retorna el impuesto serializado
        return impuesto.toBuffer();
    }

    /**
     * Transacción para validar el impuesto.
     *
     * @param {Context} ctx El contexto de la transacción
     * @param {String} placa La placa del vehículo sobre el cual se genera el impuesto
     * @param {String} anioPagar El año que se va a pagar con este impuesto
    */
    async validar(ctx, placa, anioPagar) {


        //TODO: Recupere el impuesto correspondiente con las propiedades que conforman su llave única
     

        //TODO: Lance una excepción (new Error) si el impuesto no ha sido pagado o si ya fue validado
       
        //En este espacio la Secretaria verificaria la autenticidad del banco,
        //la correspondencia de atributos clave y el estado del propietario según sus reglas internas.
        //Lo anterior, validando contra la información almacenada en sus servidores.

        //TODO: Finalmente, haga la transición de PAGADO a VALIDADO
      
        //Se actualiza el estado del mundo del ledger y se retorna el impuesto serializado.
        await ctx.impuestoList.updateImpuesto(impuesto);
        return impuesto.toBuffer();
    }

}

/**
 * Funcion auxiliar para manejar las fechas.
 * Retorna la fecha deseada con formato YYYYMMDD
 */
Date.prototype.yyyymmdd = function() {
    var mm = this.getMonth() + 1; // getMonth() is zero-based
    var dd = this.getDate();
  
    return [this.getFullYear(),
            (mm>9 ? '' : '0') + mm,
            (dd>9 ? '' : '0') + dd
           ].join('');
  };
  

module.exports = ImpuestoContract;
