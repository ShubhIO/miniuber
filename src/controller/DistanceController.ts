// var distance =require('google-distance');

// export class DistanceController {
// 	_mode: string;
// 	_origin: any;
// 	_destination: any;

// 	constructor(origin: string, destination: string, mode = 'driving') {
// 		distance.apiKey = 'AIzaSyCglq0Kms8522RFz1DdeJUljlN5qHIKWsY'; // You can ignore this and remove this line

// 		this._mode = mode;
// 		this._origin = origin;
// 		this._destination = destination;
// 	}

// 	get() {
// 		return new Promise((resolve, reject) => {
// 			distance.get({
// 				mode: this._mode,
// 				origin: this._origin,
// 				destination: this._destination,
// 			}, (error: any, data: {} | PromiseLike<{}>) => {
// 				if (error) reject(error);

// 				resolve(data);
// 			});
// 		});
// 	}
// }